import { describe, it, expect } from 'vitest';
import {
    base32Decode,
    base32Encode,
    generateBackupCodes,
    generateCode,
    generateSecret,
    verifyCode,
    buildOtpAuthUrl,
} from './totp';

describe('base32 encoding', () => {
    it('round-trips arbitrary bytes', () => {
        const input = Buffer.from('Hello, world!');
        expect(base32Decode(base32Encode(input)).equals(input)).toBe(true);
    });

    it('matches known RFC 4648 vector "foobar"', () => {
        expect(base32Encode(Buffer.from('foobar'))).toBe('MZXW6YTBOI');
    });
});

describe('TOTP', () => {
    it('generates a 6-digit numeric code', () => {
        const secret = generateSecret();
        const code = generateCode(secret);
        expect(code).toMatch(/^\d{6}$/);
    });

    it('verifies a freshly generated code', () => {
        const secret = generateSecret();
        const now = new Date();
        expect(verifyCode(secret, generateCode(secret, now), now)).toBe(true);
    });

    it('tolerates a ±30s clock drift', () => {
        const secret = generateSecret();
        const t = new Date('2026-05-01T12:00:00Z');
        const codeAt = generateCode(secret, t);
        // Verifier 25s in the past should still accept
        expect(verifyCode(secret, codeAt, new Date(t.getTime() - 25_000))).toBe(true);
        // Verifier 25s in the future should still accept
        expect(verifyCode(secret, codeAt, new Date(t.getTime() + 25_000))).toBe(true);
    });

    it('rejects codes more than one step away', () => {
        const secret = generateSecret();
        const t = new Date('2026-05-01T12:00:00Z');
        const codeAt = generateCode(secret, t);
        // 120s drift — definitely outside ±1 step
        const result = verifyCode(secret, codeAt, new Date(t.getTime() + 120_000));
        expect(result).toBe(false);
    });

    it('rejects malformed input without throwing', () => {
        const secret = generateSecret();
        expect(verifyCode(secret, 'abc')).toBe(false);
        expect(verifyCode(secret, '')).toBe(false);
        expect(verifyCode(secret, '1234567')).toBe(false);
    });

    it('rejects codes minted from a different secret', () => {
        const secretA = generateSecret();
        const secretB = generateSecret();
        const now = new Date();
        const codeA = generateCode(secretA, now);
        expect(verifyCode(secretB, codeA, now)).toBe(false);
    });
});

describe('otpauth URL', () => {
    it('includes the required fields for an authenticator app', () => {
        const url = buildOtpAuthUrl({
            secret: 'JBSWY3DPEHPK3PXP',
            accountName: 'admin@example.com',
            issuer: 'Dr. Manolova Clinic',
        });
        expect(url).toMatch(/^otpauth:\/\/totp\//);
        expect(url).toContain('secret=JBSWY3DPEHPK3PXP');
        expect(url).toContain('issuer=Dr.+Manolova+Clinic');
        expect(url).toContain('digits=6');
        expect(url).toContain('period=30');
    });
});

describe('backup codes', () => {
    it('generates the requested number of codes, all unique', () => {
        const codes = generateBackupCodes(10);
        expect(codes).toHaveLength(10);
        expect(new Set(codes).size).toBe(10);
        for (const c of codes) expect(c).toMatch(/^[0-9A-F]{5}-[0-9A-F]{5}$/);
    });
});
