import { test, expect } from '@playwright/test';

test.use({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
});

test.describe('Mobile Booking Flow & Redirect Verification', () => {
    test('User is redirected to /book after login and can complete booking', async ({ page }) => {
        // 1. Visit Login
        await page.goto('/login');

        // 2. Perform Login
        await page.fill('input[name="email"]', 'patient@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button:has-text("Login")');

        // 3. Verify Automatic Redirect to /book
        // This confirms the "redirect" callback in auth.ts works
        await expect(page).toHaveURL(/\/book/, { timeout: 15000 });

        // 4. Verify "System Offline" is NOT present
        const systemOffline = page.getByText('System Offline');
        await expect(systemOffline).not.toBeVisible();

        // 5. Select Service (Touch interaction check)
        await expect(page.getByRole('heading', { name: 'Online Booking' })).toBeVisible();
        await page.getByRole('button', { name: /Standard Consultation/i }).tap(); // Use tap for mobile

        // 6. Select Date/Time
        // Wait for slots to load
        const slot = page.locator('button:not([disabled])').filter({ hasText: /^\d{2}:\d{2}$/ }).first();
        await expect(slot).toBeVisible();
        await slot.tap();

        // 7. Confirm
        await expect(page.getByText(/Confirm Standard Consultation/)).toBeVisible();
        // Check for scroll trapping issue (manual verification proxy: element should be clickable)
        const confirmBtn = page.getByRole('button', { name: 'CONFIRM APPOINTMENT' });
        await confirmBtn.scrollIntoViewIfNeeded(); // Should work if page scrolls
        await confirmBtn.tap();

        // 8. Success
        await expect(page).toHaveURL(/\/book\/success/, { timeout: 15000 });
        await expect(page.getByText('Booking Successful')).toBeVisible();
    });
});
