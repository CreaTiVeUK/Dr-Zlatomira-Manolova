import { test, expect } from '@playwright/test';

test.describe('Availability API Integration', () => {
    test('should fetch availability with valid date range', async ({ request }) => {
        const start = new Date().toISOString();
        const end = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const response = await request.get('/api/availability', {
            params: { start, end }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data).toHaveProperty('takenSlots');
        expect(Array.isArray(data.takenSlots)).toBeTruthy();
    });

    test('should return 400 for invalid date format', async ({ request }) => {
        const response = await request.get('/api/availability', {
            params: { start: 'invalid-date' }
        });
        expect(response.status()).toBe(400);
    });

    // Test Rate Limiting (Optional - might be flaky in CI if other tests run in parallel)
    test('should eventually rate limit excessive requests', async ({ request }) => {
        // We set limit to 20/min. Let's fire 25.
        // This test might be sensitive to shared IP/env, so we make it soft assertion or skip if needed.
        let rateLimited = false;
        for (let i = 0; i < 30; i++) {
            const res = await request.get('/api/availability');
            if (res.status() === 429) {
                rateLimited = true;
                break;
            }
        }
        // Ideally we expect true, but in some test envs IP is mocked or bypassed?
        // Let's assert if we are strictly testing local
        expect(rateLimited).toBeTruthy();
    });
});
