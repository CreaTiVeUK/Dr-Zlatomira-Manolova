import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

let _cachedKey: Buffer | null = null;

/**
 * Derives a stable 32-byte AES key from PII_ENCRYPTION_KEY using SHA-256.
 * - Accepts keys of any length (no silent truncation).
 * - Throws in ALL environments if the key is not set — there is no insecure
 *   dev fallback. Use a 32+ character random string in your local .env.
 */
function getEncryptionKey(): Buffer {
    if (_cachedKey) return _cachedKey;

    const keyStr = process.env.PII_ENCRYPTION_KEY;
    if (!keyStr || keyStr.length < 32) {
        throw new Error(
            "PII_ENCRYPTION_KEY must be set and at least 32 characters. " +
            "Generate one with: openssl rand -hex 32"
        );
    }

    // SHA-256 produces a stable 32-byte key from any-length input —
    // no silent truncation, no padding.
    _cachedKey = crypto.createHash("sha256").update(keyStr).digest();
    return _cachedKey;
}

export function encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    // Format: iv:encrypted:tag
    return `${iv.toString("hex")}:${encrypted}:${tag.toString("hex")}`;
}

// iv (12 bytes = 24 hex) : ciphertext (hex) : auth tag (16 bytes = 32 hex).
// Matching the exact shape — not just "contains a colon" — keeps legacy
// plaintext values that happen to contain colons (summaries, phone notes)
// from being mangled into "[ENCRYPTED DATA]".
const ENCRYPTED_FORMAT = /^[0-9a-f]{24}:[0-9a-f]+:[0-9a-f]{32}$/i;

export function decrypt(hash: string): string {
    if (!hash || !ENCRYPTED_FORMAT.test(hash)) return hash;

    try {
        const [ivHex, encryptedHex, tagHex] = hash.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const tag = Buffer.from(tagHex, "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encryptedHex, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (err) {
        console.error("Decryption failed:", err);
        return "[ENCRYPTED DATA]";
    }
}
