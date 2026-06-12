import { test, expect } from '@playwright/test';

/**
 * The product default is Bulgarian (primary audience) — server, <html lang>,
 * and client provider must all agree (they used to disagree, which made every
 * page flash English before settling on Bulgarian).
 *
 * The rest of the suite pins language=en via storageState in
 * playwright.config.ts; the default-language tests below clear it.
 */

test.describe('Default language (no cookie)', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('defaults to Bulgarian with no English flash', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('html')).toHaveAttribute('lang', 'bg');
        await expect(page.locator('h1').first()).toContainText('Детски лекар в Пловдив');

        // The header settles in Bulgarian — and must not be left in English
        // by a late-arriving client dictionary
        await expect(page.locator('.logo-text').first()).toContainText('Д-р Златомира Манолова');

        const bodyText = await page.evaluate(() => document.body.innerText);
        expect(bodyText).not.toContain('Paediatrician in Plovdiv');
    });

    test('switches to English via the header toggle', async ({ page }) => {
        await page.goto('/');

        // In Bulgarian the toggle offers English
        await page.getByTitle('Switch to English').click();
        await expect(page.getByTitle('Switch to Bulgarian')).toBeVisible();

        await expect(page.locator('h1').first()).toContainText('Paediatrician in Plovdiv');
        await expect(page.locator('.logo-text').first()).toContainText('Dr. Zlatomira Manolova');
    });

    test('language choice persists across navigation', async ({ page }) => {
        await page.goto('/');
        await page.getByTitle('Switch to English').click();
        await expect(page.getByTitle('Switch to Bulgarian')).toBeVisible();

        const servicesLink = page.locator('.nav-center a[href="/services"]');
        await expect(servicesLink).toContainText('SERVICES');
        await servicesLink.click();

        await expect(page).toHaveURL(/.*services/);
        await expect(page.locator('h1').first()).toContainText('Our Pediatric Services');
    });
});

test.describe('English (suite default cookie)', () => {
    test('Contact page renders English and can switch to Bulgarian', async ({ page }) => {
        await page.goto('/contact');
        await expect(page.locator('h1').first()).toContainText('Book an Appointment');

        await page.getByTitle('Switch to Bulgarian').click();
        await expect(page.getByTitle('Switch to English')).toBeVisible();
        await expect(page.locator('h1').first()).toContainText('Запишете час');
    });

    test('Login page renders English and can switch to Bulgarian', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('Login');

        await page.getByTitle('Switch to Bulgarian').click();
        await expect(page.getByTitle('Switch to English')).toBeVisible();
        await expect(page.getByRole('heading', { level: 1 }).first()).toContainText('Вход');
    });
});
