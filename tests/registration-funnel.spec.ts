import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

/**
 * End-to-end registration funnel: register → login blocked until verified →
 * verify (token read straight from the DB, standing in for the email link) →
 * login succeeds.
 *
 * This is the flow that silently locks out every new patient when email
 * delivery or the verification gate breaks — exactly what happened when the
 * sender domain couldn't be verified in Resend.
 *
 * CI-only: it needs direct DB access for the token, and must never run
 * against a non-disposable database.
 */

test.describe('Registration funnel', () => {
    test.skip(!process.env.CI, 'requires direct DB access to read the verification token (CI only)');

    test('register → unverified login blocked → verify → login works', async ({ page }) => {
        const prisma = new PrismaClient();
        const email = `e2e-reg-${Date.now()}@example.com`;
        const password = 'Sup3r#Secure!42x';

        try {
            // 1. Register. Unique X-Forwarded-For so the per-IP register rate
            // limit can't be exhausted by other tests / retries sharing "unknown".
            const registerRes = await page.request.post('/api/register', {
                headers: { 'x-forwarded-for': `10.0.${Date.now() % 256}.${(Date.now() >> 8) % 256}` },
                data: { name: 'E2E Funnel', email, password },
            });
            expect(registerRes.status()).toBe(201);

            // 2. Login must be blocked until the email is verified
            await page.goto('/login');
            await page.fill('input[name="email"]', email);
            await page.fill('input[name="password"]', password);
            await page.click('button:has-text("Login")');
            await expect(page.getByText(/verify your email/i).first()).toBeVisible({ timeout: 15000 });

            // 3. Pull the verification token from the DB (the emailed link)
            const token = await prisma.verificationToken.findFirst({ where: { identifier: email } });
            expect(token, 'verification token should have been created').not.toBeNull();

            const verifyRes = await page.request.get(
                `/api/verify-email?token=${token!.token}&email=${encodeURIComponent(email)}`
            );
            expect(verifyRes.status()).toBe(200);

            // 4. Login now succeeds
            await page.goto('/login');
            await page.fill('input[name="email"]', email);
            await page.fill('input[name="password"]', password);
            await page.click('button:has-text("Login")');
            await page.waitForURL((url: URL) => ['/', '/book'].includes(url.pathname), { timeout: 15000 });
        } finally {
            // Audit logs reference the user — clear them first (FK constraint)
            const created = await prisma.user.findUnique({ where: { email }, select: { id: true } });
            if (created) {
                await prisma.auditLog.deleteMany({ where: { userId: created.id } });
                await prisma.user.delete({ where: { id: created.id } });
            }
            await prisma.verificationToken.deleteMany({ where: { identifier: email } });
            await prisma.$disconnect();
        }
    });
});
