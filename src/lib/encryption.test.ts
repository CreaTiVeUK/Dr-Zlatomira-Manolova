import { describe, it, expect, beforeAll } from 'vitest';

describe('Encryption Utility', () => {
    let encrypt: typeof import('./encryption').encrypt;
    let decrypt: typeof import('./encryption').decrypt;
    let tryDecrypt: typeof import('./encryption').tryDecrypt;
    let DecryptionError: typeof import('./encryption').DecryptionError;

    beforeAll(async () => {
        // 64 hex chars = 32 bytes, satisfies the runtime length check
        process.env.PII_ENCRYPTION_KEY = "0".repeat(64);
        ({ encrypt, decrypt, tryDecrypt, DecryptionError } = await import('./encryption'));
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

    it('should pass through values that are not in the ciphertext format', () => {
        expect(decrypt("invalid-hash")).toBe("invalid-hash");
        // Legacy plaintext containing colons must NOT be treated as ciphertext
        expect(decrypt("Key Concerns: fever, cough")).toBe("Key Concerns: fever, cough");
        expect(decrypt("+359 888 123: home")).toBe("+359 888 123: home");
    });

    it('should THROW on tampered ciphertext instead of returning a placeholder', () => {
        const encrypted = encrypt("Sensitive");
        const [iv, ct, tag] = encrypted.split(":");
        const tampered = `${iv}:${ct.replace(/^./, ct[0] === "0" ? "1" : "0")}:${tag}`;
        expect(() => decrypt(tampered)).toThrow(DecryptionError);
    });

    it('tryDecrypt returns null instead of throwing', () => {
        const encrypted = encrypt("Sensitive");
        const [iv, ct, tag] = encrypted.split(":");
        const tampered = `${iv}:${ct.replace(/^./, ct[0] === "0" ? "1" : "0")}:${tag}`;
        expect(tryDecrypt(tampered)).toBeNull();
        expect(tryDecrypt(encrypted)).toBe("Sensitive");
        expect(tryDecrypt("plain text")).toBe("plain text");
    });
});
