import { describe, it, expect } from 'vitest';
import { checkPasswordStrength, MIN_LENGTH, MIN_SCORE } from './password-strength';

describe('checkPasswordStrength', () => {
    it('rejects passwords shorter than the minimum length', () => {
        const result = checkPasswordStrength('Sh0rt!Pw');
        expect(result.valid).toBe(false);
        expect(result.score).toBe(0);
        expect(result.reason).toMatch(new RegExp(`at least ${MIN_LENGTH}`));
    });

    it('rejects the classic weak-but-complex "Password1!" style', () => {
        // 12 chars and meets all legacy regex rules, but zxcvbn scores it ≤ 1
        const result = checkPasswordStrength('Password1!aB');
        expect(result.valid).toBe(false);
        expect(result.score).toBeLessThan(MIN_SCORE);
    });

    it('penalizes passwords that repeat the user name', () => {
        const withoutContext = checkPasswordStrength('ZlatomiraZlatomira');
        const withContext = checkPasswordStrength('ZlatomiraZlatomira', ['zlatomira']);
        // zxcvbn should score lower when the token is a known user input.
        expect(withContext.score).toBeLessThanOrEqual(withoutContext.score);
    });

    it('accepts a strong passphrase', () => {
        const result = checkPasswordStrength('correct horse battery staple river');
        expect(result.valid).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(MIN_SCORE);
    });

    it('accepts a long random-ish password', () => {
        const result = checkPasswordStrength('Tg$7pLq!zM9xVe2Wn');
        expect(result.valid).toBe(true);
    });

    it('tolerates pathologically long input without hanging', () => {
        const giant = 'A1b!'.repeat(10_000);
        const started = Date.now();
        const result = checkPasswordStrength(giant);
        expect(Date.now() - started).toBeLessThan(2_000);
        // Truncation at 128 chars keeps zxcvbn fast; value here is that it returns.
        expect(typeof result.valid).toBe('boolean');
    });
});
