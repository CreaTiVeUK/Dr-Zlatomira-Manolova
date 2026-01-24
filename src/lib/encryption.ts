import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = (process.env.PII_ENCRYPTION_KEY || "default-32-character-secret-key-!!!").substring(0, 32);

export function encrypt(text: string): string {
    if (!text) return text;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);

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

        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encryptedHex, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (err) {
        console.error("Decryption failed:", err);
        return "[ENCRYPTED DATA]";
    }
}
