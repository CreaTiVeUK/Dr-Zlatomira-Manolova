import { test, expect } from '@playwright/test';

// Smoke test for the patient messaging surface. Exercises auth gating and
// verifies the conversation view renders + a draft can be typed (we stop
// short of submitting to avoid persisting fixture noise).
test.describe('Patient messaging', () => {
    test('Unauthenticated visit redirects to login', async ({ page }) => {
        await page.goto('/messages');
        await expect(page).toHaveURL(/\/login/);
    });

    test('Patient can open the conversation view', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'patient@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button:has-text("Login")');

        await page.waitForURL(url => ['/', '/book'].includes(url.pathname), { timeout: 15000 });

        await page.goto('/messages');
        await expect(page.getByRole('heading', { name: /Clinic conversation|Разговор с клиниката/ })).toBeVisible({ timeout: 15000 });

        const composer = page.getByPlaceholder(/Write a message|Напишете съобщение/);
        await expect(composer).toBeVisible();
        await composer.fill('Test draft from Playwright — not submitted');

        const send = page.getByRole('button', { name: /Send|Изпрати/ });
        await expect(send).toBeEnabled();
    });
});
