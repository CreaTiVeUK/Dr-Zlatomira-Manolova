import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('rateLimit (in-memory fallback)', () => {
    beforeEach(() => {
        // Force the in-memory path; re-import the module to pick up cleared state.
        vi.unstubAllEnvs();
        vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
        vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
        vi.resetModules();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
    });

    it('allows requests under the limit and reports remaining', async () => {
        const { rateLimit } = await import('./rate-limit');

        const r1 = await rateLimit('1.2.3.4', 3, 60_000);
        const r2 = await rateLimit('1.2.3.4', 3, 60_000);
        const r3 = await rateLimit('1.2.3.4', 3, 60_000);

        expect(r1).toEqual({ success: true, remaining: 2 });
        expect(r2).toEqual({ success: true, remaining: 1 });
        expect(r3).toEqual({ success: true, remaining: 0 });
    });

    it('blocks requests once the limit is exceeded', async () => {
        const { rateLimit } = await import('./rate-limit');

        await rateLimit('5.6.7.8', 2, 60_000);
        await rateLimit('5.6.7.8', 2, 60_000);
        const blocked = await rateLimit('5.6.7.8', 2, 60_000);

        expect(blocked.success).toBe(false);
        expect(blocked.remaining).toBe(0);
    });

    it('isolates buckets per identifier', async () => {
        const { rateLimit } = await import('./rate-limit');

        await rateLimit('a', 1, 60_000);
        const aBlocked = await rateLimit('a', 1, 60_000);
        const bAllowed = await rateLimit('b', 1, 60_000);

        expect(aBlocked.success).toBe(false);
        expect(bAllowed.success).toBe(true);
    });

    it('resets the window after it expires', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

        const { rateLimit } = await import('./rate-limit');

        await rateLimit('time-test', 1, 1_000);
        const blocked = await rateLimit('time-test', 1, 1_000);
        expect(blocked.success).toBe(false);

        // Advance past the window
        vi.setSystemTime(new Date('2026-01-01T00:00:02Z'));

        const reset = await rateLimit('time-test', 1, 1_000);
        expect(reset.success).toBe(true);
        expect(reset.remaining).toBe(0);
    });
});
