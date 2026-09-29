/**
 * Builds rate-limit identifiers that don't put personal data in Redis.
 *
 * The per-email buckets (login, password reset, forgot-password) previously
 * used the address verbatim — `login:parent@example.com` — which made the
 * Upstash keyspace a live list of everyone who uses the practice, readable by
 * anyone with the REST token and retained for the window's TTL.
 *
 * HMAC rather than a plain digest: email addresses come from a small,
 * enumerable space, so a bare SHA-256 is reversible by hashing a candidate
 * list. Keying with AUTH_SECRET (required, >=32 chars) means the digests are
 * only meaningful to this deployment.
 *
 * The output is stable for a given address, so per-email limits keep working
 * exactly as before.
 */

import { createHmac } from "crypto";

export function emailRateLimitKey(prefix: string, email: string): string {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
        // Dev/test without AUTH_SECRET: fall back to the raw address rather
        // than silently collapsing every user into one shared bucket.
        return `${prefix}:${email}`;
    }
    const digest = createHmac("sha256", secret).update(email.toLowerCase()).digest("base64url").slice(0, 32);
    return `${prefix}:${digest}`;
}
