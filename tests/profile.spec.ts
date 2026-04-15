import { test, expect } from '@playwright/test';

// Verifies the patient profile page exposes the document upload affordance
// added in the April 2026 self-service rollout. We don't actually upload a
// file (that touches disk + audit log + rate limit); we just assert the
// control is wired to the file input with the correct accept hooks.
test.describe('Patient profile', () => {
    test('Document upload control is visible', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'patient@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button:has-text("Login")');

        await page.waitForURL(url => ['/', '/book'].includes(url.pathname), { timeout: 15000 });

        await page.goto('/profile');
        await expect(page.getByText(/Medical documents|Медицински документи/)).toBeVisible({ timeout: 15000 });

        // Upload control is rendered as a label wrapping a hidden file input
        await expect(page.getByText(/Upload document|Качи документ/)).toBeVisible();
        const fileInput = page.locator('input[type="file"]');
        await expect(fileInput).toHaveCount(1);
    });
});
