import { test, expect } from '@playwright/test';

// Smoke for the password reset request page. Always returns the same
// generic success copy regardless of whether the email exists, so we just
// verify the form submits and the confirmation banner appears.
test.describe('Password reset request', () => {
    test('Submitting an unknown email still shows the generic confirmation', async ({ page }) => {
        await page.goto('/forgot-password');
        await page.fill('input[type="email"]', `nobody-${Date.now()}@example.com`);
        await page.getByRole('button', { name: /Send reset link|Изпрати/ }).click();

        await expect(page.getByText(/check your email|проверете пощата си/i)).toBeVisible({ timeout: 15000 });
    });
});
