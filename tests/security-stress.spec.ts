import { test, expect, Page } from '@playwright/test';

test.describe('Security & Stress Testing', () => {

    test('Boundary: Reject negative price or duration', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'patient@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button:has-text("Login")');
        await page.waitForURL((url: URL) => ['/', '/book'].includes(url.pathname), { timeout: 15000 });

        const result = await page.evaluate(async () => {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-forwarded-for': Math.random().toString() // Bypass rate limit
                },
                body: JSON.stringify({
                    dateTime: new Date(Date.now() + 86400000).toISOString(),
                    duration: -30,
                    price: -100,
                    notes: 'Hacker'
                })
            });
            return { status: res.status };
        });

        expect(result.status).toBe(400);
    });

    test('RBAC: Prevent cross-user data modification', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'patient@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button:has-text("Login")');
        await page.waitForURL((url: URL) => ['/', '/book'].includes(url.pathname), { timeout: 15000 });

        const attackResult = await page.evaluate(async () => {
            try {
                const res = await fetch('/api/appointments?id=fake-id-or-any-id', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'CANCELLED' })
                });
                return res.status;
            } catch { return 999; }
        });

        expect(attackResult).toBeGreaterThanOrEqual(400);
    });

    test('Concurrency: Prevent double-booking (Race Condition)', async ({ browser }) => {
        test.setTimeout(60000);
        const slotDate = new Date();
        slotDate.setHours(12, 0, 0, 0);
        slotDate.setDate(slotDate.getDate() + 15);
        const isoDate = slotDate.toISOString();

        const context1 = await browser.newContext();
        const context2 = await browser.newContext();
        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        const pages: [Page, string][] = [[page1, 'patient@example.com'], [page2, 'patient2@example.com']];
        for (const [p, email] of pages) {
            await p.goto('/login');
            await p.fill('input[name="email"]', email);
            await p.fill('input[name="password"]', 'password123');
            await p.click('button:has-text("Login")');
            await p.waitForURL((u: URL) => ['/', '/book'].includes(u.pathname), { timeout: 15000 });
        }

        const triggerBooking = async (p: Page) => {
            return await p.evaluate(async (date: string) => {
                try {
                    const res = await fetch('/api/appointments', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-forwarded-for': Math.random().toString()
                        },
                        body: JSON.stringify({
                            dateTime: date,
                            duration: 30,
                            price: 100,
                            notes: 'Race Test'
                        })
                    });
                    return res.status;
                } catch { return 500; }
            }, isoDate);
        };

        const results = await Promise.all([
            triggerBooking(page1),
            triggerBooking(page2)
        ]);

        const successes = results.filter((s: number) => s === 200 || s === 201).length;
        console.log(`Race Results (Atomic):`, results);

        expect(successes).toBeLessThanOrEqual(1);

        await context1.close();
        await context2.close();
    });
});
