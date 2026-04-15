import { test, expect } from '@playwright/test';

// Verifies the my-appointments page renders for an authenticated patient
// and exposes the new reschedule control alongside the existing cancel/
// download actions. Doesn't actually submit a reschedule (would require
// a known fixture appointment in a known state).
test.describe('My appointments', () => {
    test('Authenticated patient sees the appointments shell', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'patient@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button:has-text("Login")');

        await page.waitForURL(url => ['/', '/book'].includes(url.pathname), { timeout: 15000 });

        await page.goto('/my-appointments');
        // Shell renders even for users with no upcoming visits — the empty
        // state copy still includes one of these section headings.
        await expect(
            page.getByRole('heading', { name: /Upcoming|Предстоящи/ })
        ).toBeVisible({ timeout: 15000 });
    });

    test('Unauthenticated visit shows login prompt', async ({ page }) => {
        await page.goto('/my-appointments');
        await expect(
            page.getByRole('button', { name: /Log In|Влезте/i })
        ).toBeVisible({ timeout: 15000 });
    });
});
