import { test, expect } from '@playwright/test';

test.describe('Authentication & Access Control', () => {
    test('Admin should reach dashboard', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@sunnypediatrics.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button:has-text("Login")');

        // Wait for potential redirect
        await page.waitForURL(/admin\/dashboard/);
        await expect(page.getByRole('heading', { level: 1, name: 'Practice Control Center' })).toBeVisible();
    });

    test('Patient should reach home but not admin dashboard', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'patient@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button:has-text("Login")');

        await page.waitForURL(url => ['/', '/book'].includes(url.pathname), { timeout: 15000 });

        // Try direct access to admin
        await page.goto('/admin/dashboard');
        await expect(page).toHaveURL(url => ['/', '/book'].includes(url.pathname), { timeout: 15000 });
    });

    test('Invalid login should show error', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[name="email"]', 'wrong@example.com');
        await page.fill('input[name="password"]', 'wrongpass');
        await page.click('button:has-text("Login")');

        const errorLoc = page.getByText(/Invalid credentials|Security verification failed/);
        await expect(errorLoc.first()).toBeVisible({ timeout: 15000 });
    });
});
