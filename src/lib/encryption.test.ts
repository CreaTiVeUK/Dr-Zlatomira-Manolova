import { describe, it, expect, beforeAll } from 'vitest';

describe('Encryption Utility', () => {
    let encrypt: typeof import('./encryption').encrypt;
    let decrypt: typeof import('./encryption').decrypt;

    beforeAll(async () => {
        // 64 hex chars = 32 bytes, satisfies the runtime length check
        process.env.PII_ENCRYPTION_KEY = "0".repeat(64);
        ({ encrypt, decrypt } = await import('./encryption'));
    });

    it('should encrypt and decrypt correctly', () => {
        const secret = "Sensitive Data 123";
        const encrypted = encrypt(secret);
        expect(encrypted).not.toBe(secret);
        expect(encrypted).toContain(":");

        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(secret);
    });

    it('should handle empty input', () => {
        expect(encrypt("")).toBe("");
        expect(decrypt("")).toBe("");
    });

    it('should fail gracefully with malformed hash', () => {
        expect(decrypt("invalid-hash")).toBe("invalid-hash");
    });
});
