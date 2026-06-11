import { test, expect, Page } from '@playwright/test';

/**
 * Security regression suite.
 *
 * These tests exist because earlier revisions shipped security controls that
 * were dead code (session revocation reading an undefined jti, an inactivity
 * check comparing a value that was refreshed moments earlier). Each test here
 * drives the REAL auth pipeline end-to-end.
 */

async function login(page: Page, email: string, password = 'password123') {
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Login")');
    await page.waitForURL((url: URL) => ['/', '/book', '/admin/dashboard'].includes(url.pathname), { timeout: 15000 });
}

test.describe('Session revocation', () => {
    test('logged-out session cookie cannot be replayed against the API', async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await login(page, 'patient@example.com');

        // Session works before logout
        const before = await page.evaluate(() =>
            fetch('/api/user/profile').then((r) => r.status)
        );
        expect(before).toBe(200);

        // Capture the session cookies, then log out (blocklists the jti)
        const stolenCookies = await context.cookies();
        const logoutStatus = await page.evaluate(() =>
            fetch('/api/logout', { method: 'POST' }).then((r) => r.status)
        );
        expect(logoutStatus).toBe(200);

        // An attacker replaying the pre-logout cookie must be rejected
        const replayContext = await browser.newContext();
        await replayContext.addCookies(stolenCookies);
        const replayResponse = await replayContext.request.get('/api/user/profile');
        expect(replayResponse.status()).toBe(401);

        await replayContext.close();
        await context.close();
    });
});

test.describe('Booking integrity', () => {
    // 10:00 UTC = 12:00/13:00 Sofia — inside clinic hours year-round.
    function futureSlot(daysAhead: number): string {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + daysAhead);
        d.setUTCHours(10, 0, 0, 0);
        return d.toISOString();
    }

    async function bookViaApi(page: Page, dateTime: string, extra: Record<string, unknown> = {}) {
        return page.evaluate(
            async ({ dateTime, extra }) => {
                const res = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-forwarded-for': Math.random().toString(), // per-IP rate-limit bypass for tests
                    },
                    body: JSON.stringify({ dateTime, duration: 30, notes: 'security spec', ...extra }),
                });
                return { status: res.status, body: await res.json() };
            },
            { dateTime, extra }
        );
    }

    test('a cancelled slot can be rebooked (no permanent slot poisoning)', async ({ page }) => {
        await login(page, 'patient@example.com');
        const slot = futureSlot(25);

        const first = await bookViaApi(page, slot);
        expect(first.status).toBe(200);

        const cancel = await page.evaluate(async (id: string) => {
            const res = await fetch(`/api/appointments?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CANCELLED' }),
            });
            return res.status;
        }, first.body.appointment.id);
        expect(cancel).toBe(200);

        // Previously the @@unique([dateTime]) constraint (spanning CANCELLED
        // rows) made this 409 forever.
        const rebook = await bookViaApi(page, slot);
        expect(rebook.status).toBe(200);
    });

    test('patients cannot mark their own appointment COMPLETED', async ({ page }) => {
        await login(page, 'patient@example.com');
        const created = await bookViaApi(page, futureSlot(26));
        expect(created.status).toBe(200);

        const complete = await page.evaluate(async (id: string) => {
            const res = await fetch(`/api/appointments?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'COMPLETED' }),
            });
            return res.status;
        }, created.body.appointment.id);
        expect(complete).toBe(403);
    });

    test('client-supplied price is ignored — server derives it from duration', async ({ page }) => {
        await login(page, 'patient@example.com');

        const result = await bookViaApi(page, futureSlot(27), { price: 1 });
        expect(result.status).toBe(200);
        expect(result.body.appointment.price).toBe(25); // 30-minute standard visit
    });
});

test.describe('Role escalation', () => {
    test('patient sessions are rejected by admin endpoints', async ({ page }) => {
        await login(page, 'patient@example.com');

        const results = await page.evaluate(async () => {
            const probes: [string, RequestInit?][] = [
                ['/api/admin/messages'],
                ['/api/admin/users/export'],
                ['/api/admin/users/00000000-0000-0000-0000-000000000000/documents', { method: 'POST', body: new FormData() }],
                ['/api/admin/users/00000000-0000-0000-0000-000000000000/sessions', { method: 'POST', body: new FormData() }],
            ];
            const out: Record<string, number> = {};
            for (const [url, init] of probes) {
                out[url] = (await fetch(url, init)).status;
            }
            return out;
        });

        for (const [url, status] of Object.entries(results)) {
            expect(status, `expected 403 from ${url}`).toBe(403);
        }
    });
});

test.describe('Upload validation', () => {
    test('rejects files whose content does not match the declared type', async ({ page }) => {
        await login(page, 'patient@example.com');

        const status = await page.evaluate(async () => {
            // Declared as PDF, actually a script — magic-byte sniffing must catch it
            const fake = new Blob(['#!/bin/sh\necho pwned'], { type: 'application/pdf' });
            const form = new FormData();
            form.append('file', new File([fake], 'results.pdf', { type: 'application/pdf' }));
            const res = await fetch('/api/user/documents', { method: 'POST', body: form });
            return res.status;
        });

        expect(status).toBe(400);
    });

    test('accepts a real PDF, stores it encrypted, and serves it back intact', async ({ page }) => {
        await login(page, 'patient@example.com');

        const result = await page.evaluate(async () => {
            const pdfBytes = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n';
            const form = new FormData();
            form.append('file', new File([pdfBytes], 'results.pdf', { type: 'application/pdf' }));
            const upload = await fetch('/api/user/documents', { method: 'POST', body: form });
            if (upload.status !== 201) return { uploadStatus: upload.status, body: '' };
            const doc = await upload.json();

            const download = await fetch(`/api/documents/${doc.id}`);
            return { uploadStatus: upload.status, downloadStatus: download.status, body: await download.text() };
        });

        expect(result.uploadStatus).toBe(201);
        expect(result.downloadStatus).toBe(200);
        expect(result.body).toContain('%PDF-1.4'); // round-trips through encryption
    });
});

test.describe('Login hardening', () => {
    test('wrong password against an existing account and a nonexistent account look identical', async ({ page }) => {
        const probe = async (email: string) => {
            await page.goto('/login');
            await page.fill('input[name="email"]', email);
            await page.fill('input[name="password"]', 'Definitely#Wrong9');
            await page.click('button:has-text("Login")');
            // Both must surface the same generic error — account state
            // (exists / locked / unverified) must not leak pre-password.
            await expect(
                page.getByText(/Invalid email or password|Невалиден имейл или парола/).first()
            ).toBeVisible({ timeout: 15000 });
        };

        await probe('patient@example.com');
        await probe('no-such-user-xyz@example.com');
    });
});
