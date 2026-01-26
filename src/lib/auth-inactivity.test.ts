import { describe, it, expect, vi } from 'vitest';

// Mock dependencies that fail in JSDOM/Unit environment
vi.mock("next/server", () => ({
    NextRequest: class { },
    NextResponse: class { },
}));
vi.mock("next/headers", () => ({
    cookies: () => ({}),
}));
vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

import { isSessionExpired } from './auth';

describe('Auth Inactivity Helper', () => {
    it('should return true if lastActivity is too old', () => {
        const past = Date.now() - (35 * 60 * 1000); // 35 mins ago
        expect(isSessionExpired(past)).toBe(true);
    });

    it('should return false if lastActivity is recent', () => {
        const recent = Date.now() - (5 * 60 * 1000); // 5 mins ago
        expect(isSessionExpired(recent)).toBe(false);
    });
});
