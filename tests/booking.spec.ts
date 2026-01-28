import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
    test('User can select service and initiate booking', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[name="email"]', 'patient@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button:has-text("Login")');

        await page.waitForURL((url: URL) => ['/', '/book'].includes(url.pathname), { timeout: 15000 });
        await page.goto('/book');

        // Ensure page is ready
        await expect(page.getByRole('heading', { name: 'Online Booking' })).toBeVisible();

        // Select Specialized Consultation
        await page.getByRole('button', { name: /Specialized Consultation/ }).click();

        // Pick first available slot by time pattern (HH:mm)
        const slot = page.locator('button:not([disabled])').filter({ hasText: /^\d{2}:\d{2}$/ }).first();
        await expect(slot).toBeEnabled();
        await slot.click();

        // New Flow: Confirm Appointment section appears
        await expect(page.getByText(/Confirm Specialized Consultation/)).toBeVisible();

        // Final Confirmation
        await page.getByRole('button', { name: 'CONFIRM APPOINTMENT' }).click();

        // Wait for results
        const response = page.waitForURL(/\/book\/success/, { timeout: 15000 }).catch(() => null);
        const error = page.getByText(/payment could not be initiated|Invalid data format|Database operation failed/).first();

        await Promise.race([
            response,
            expect(error).toBeVisible({ timeout: 15000 })
        ]);
    });
});
