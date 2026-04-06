import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// Key is computed lazily to allow test environments to run without env vars.
let _cachedKey: string | null = null;

function getEncryptionKey(): string {
    if (_cachedKey) return _cachedKey;
    const keyStr = process.env.PII_ENCRYPTION_KEY;
    if (!keyStr || keyStr.length < 32) {
        if (process.env.NODE_ENV === "production") {
            throw new Error("PII_ENCRYPTION_KEY must be set and at least 32 characters in production");
        }
        console.warn("[SECURITY] PII_ENCRYPTION_KEY not set. Using insecure fallback for non-production only.");
        _cachedKey = "dev-only-insecure-key-change-me!";
        return _cachedKey;
    }
    _cachedKey = keyStr.substring(0, 32);
    return _cachedKey;
}

export function encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getEncryptionKey()), iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    // Format: iv:encrypted:tag
    return `${iv.toString("hex")}:${encrypted}:${tag.toString("hex")}`;
}

export function decrypt(hash: string): string {
    if (!hash || !hash.includes(":")) return hash;

    try {
        const [ivHex, encryptedHex, tagHex] = hash.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const tag = Buffer.from(tagHex, "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getEncryptionKey()), iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encryptedHex, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (err) {
        console.error("Decryption failed:", err);
        return "[ENCRYPTED DATA]";
    }
}
