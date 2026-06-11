/**
 * RFC 6238 TOTP implementation (HMAC-SHA1, 6 digits, 30s step) with
 * RFC 4648 base32 encoding — compatible with Google Authenticator, Authy,
 * 1Password, and every other TOTP app.
 *
 * Self-contained (uses only node:crypto) so we don't pull in another
 * dependency. Time-window drift of ±1 step (≈30s) is accepted during
 * verification.
 */

import crypto from "crypto";

const PERIOD = 30;
const DIGITS = 6;
const WINDOW = 1; // accept ±1 step (30s past, 30s future)

// ─── base32 (RFC 4648) ──────────────────────────────────────────────────────
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(buf: Buffer): string {
    let bits = 0;
    let value = 0;
    let out = "";
    for (let i = 0; i < buf.length; i++) {
        value = (value << 8) | buf[i];
        bits += 8;
        while (bits >= 5) {
            out += ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }
    if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];
    return out;
}

export function base32Decode(str: string): Buffer {
    const clean = str.replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];
    for (const ch of clean) {
        const idx = ALPHABET.indexOf(ch);
        if (idx < 0) throw new Error("Invalid base32 character");
        value = (value << 5) | idx;
        bits += 5;
        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }
    return Buffer.from(bytes);
}

// ─── TOTP core ──────────────────────────────────────────────────────────────

export function generateSecret(bytes = 20): string {
    return base32Encode(crypto.randomBytes(bytes));
}

function hotp(secret: string, counter: number): string {
    const key = base32Decode(secret);
    const buf = Buffer.alloc(8);
    // 8-byte big-endian counter
    buf.writeUInt32BE(Math.floor(counter / 0x1_0000_0000), 0);
    buf.writeUInt32BE(counter % 0x1_0000_0000, 4);

    const hmac = crypto.createHmac("sha1", key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    return (code % 10 ** DIGITS).toString().padStart(DIGITS, "0");
}

export function generateCode(secret: string, when: Date = new Date()): string {
    const counter = Math.floor(when.getTime() / 1000 / PERIOD);
    return hotp(secret, counter);
}

/**
 * Verify a user-supplied 6-digit code using constant-time comparison.
 * Accepts codes from the current step and ±1 step window to tolerate
 * minor clock drift. Returns the matched time-step counter so callers can
 * enforce single use (replay protection), or null when no step matches.
 */
export function verifyCodeWithCounter(secret: string, submitted: string, when: Date = new Date()): number | null {
    const clean = submitted.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(clean)) return null;

    const baseCounter = Math.floor(when.getTime() / 1000 / PERIOD);
    for (let offset = -WINDOW; offset <= WINDOW; offset++) {
        const candidate = hotp(secret, baseCounter + offset);
        if (constantTimeEqual(candidate, clean)) return baseCounter + offset;
    }
    return null;
}

export function verifyCode(secret: string, submitted: string, when: Date = new Date()): boolean {
    return verifyCodeWithCounter(secret, submitted, when) !== null;
}

function constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    try {
        return crypto.timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
}

/**
 * Build an `otpauth://` URL that authenticator apps turn into a QR code.
 */
export function buildOtpAuthUrl(opts: { secret: string; accountName: string; issuer: string }): string {
    const label = encodeURIComponent(`${opts.issuer}:${opts.accountName}`);
    const params = new URLSearchParams({
        secret: opts.secret,
        issuer: opts.issuer,
        algorithm: "SHA1",
        digits: String(DIGITS),
        period: String(PERIOD),
    });
    return `otpauth://totp/${label}?${params.toString()}`;
}

// ─── Backup codes ───────────────────────────────────────────────────────────

export function generateBackupCodes(count = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
        const raw = crypto.randomBytes(5).toString("hex").toUpperCase();
        // Format as XXXX-XXXX for readability
        codes.push(`${raw.slice(0, 5)}-${raw.slice(5, 10)}`);
    }
    return codes;
}
