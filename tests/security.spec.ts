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
