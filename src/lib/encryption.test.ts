import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from './encryption';

describe('Encryption Utility', () => {
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
