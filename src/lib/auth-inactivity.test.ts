import { describe, it, expect, vi } from 'vitest';
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
