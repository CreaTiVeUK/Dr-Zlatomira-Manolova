import { test, expect } from '@playwright/test';

test.describe('Localization & Internationalization', () => {

    test('should default to English and contain no VISIBLE Cyrillic', async ({ page }) => {
        await page.goto('/');

        // Header verification
        await expect(page.locator('.logo-text')).toContainText('Dr. Zlatomira Manolova');

        // Hero H1 verification
        await expect(page.locator('h1').first()).toContainText('Elite Medical Care');

        // Subtitle verification
        await expect(page.getByText('Dedicated to Children.')).toBeVisible();

        // Strict Check: Ensure specific Bulgarian strings are NOT present in the visible body text
        const bodyText = await page.evaluate(() => document.body.innerText);
        expect(bodyText).not.toContain('Елитна медицинска помощ');
        expect(bodyText).not.toContain('Специализирана педиатрична помощ');
    });

    test('should switch to Bulgarian and display Cyrillic', async ({ page }) => {
        await page.goto('/');

        // Click language switcher
        await page.getByTitle('Switch to Bulgarian').click();

        // Wait for change to reflect
        await expect(page.getByTitle('Switch to English')).toBeVisible();

        // Expect Bulgarian text
        await expect(page.locator('.logo-text')).toContainText('Д-р Златомира Манолова');
        await expect(page.locator('h1').first()).toContainText('Елитна медицинска помощ');
    });

    test('should persist language across navigation', async ({ page }) => {
        await page.goto('/');
        await page.getByTitle('Switch to Bulgarian').click();

        // Wait for change
        await expect(page.getByTitle('Switch to English')).toBeVisible();

        // Check Services link text
        const servicesLink = page.locator('.nav-desktop a[href="/services"]');
        await expect(servicesLink).toContainText('УСЛУГИ');

        await servicesLink.click();

        await expect(page).toHaveURL(/.*services/);
        // Verify Services page H1 in BG
        await expect(page.locator('h1')).toContainText('Нашите педиатрични услуги');
    });

    test('should verify Contact page localization', async ({ page }) => {
        await page.goto('/contact');
        // Default EN
        await expect(page.locator('h1')).toContainText('Book an Appointment');

        // Switch
        await page.getByTitle('Switch to Bulgarian').click();

        // Wait for change
        await expect(page.getByTitle('Switch to English')).toBeVisible();

        await expect(page.locator('h1')).toContainText('Запишете час');
    });

    test('should verify Login page localization', async ({ page }) => {
        await page.goto('/login');
        // Default EN
        await expect(page.getByRole('heading', { level: 2 })).toContainText('Login');

        // Switch
        await page.getByTitle('Switch to Bulgarian').click();

        // Wait for change
        await expect(page.getByTitle('Switch to English')).toBeVisible();

        await expect(page.getByRole('heading', { level: 2 })).toContainText('Вход');
    });
});
