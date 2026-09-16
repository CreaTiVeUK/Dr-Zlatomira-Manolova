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

test('Patient sends a message, sees it after reload, and cannot use the admin inbox', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'patient@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    await page.waitForURL(url => ['/', '/book'].includes(url.pathname));

    const invalid = await page.request.post('/api/user/messages', { data: { content: '<b> </b>' } });
    expect(invalid.status()).toBe(400);
    expect((await page.request.get('/api/admin/messages')).status()).toBe(403);

    await page.goto('/messages');
    const content = `Playwright clinic message ${Date.now()}`;
    const composer = page.getByRole('textbox', { name: 'Message', exact: true });
    await composer.fill(content);
    const sent = page.waitForResponse(res => res.url().endsWith('/api/user/messages') && res.request().method() === 'POST');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    const response = await sent;
    expect(response.status()).toBe(201);
    const message = await response.json();
    try {
        await expect(page.getByRole('log').getByText(content, { exact: true })).toBeVisible();
        await expect(composer).toHaveValue('');
        await page.reload();
        await expect(page.getByRole('log').getByText(content, { exact: true })).toBeVisible();
    } finally {
        // This suite runs against the disposable development/CI database.
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        try { await prisma.message.delete({ where: { id: message.id } }); }
        finally { await prisma.$disconnect(); }
    }
});
