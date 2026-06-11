/**
 * Session revocation via Redis token blocklist.
 *
 * Two mechanisms, both backed by Upstash REST (edge-safe, no Prisma here so
 * the proxy/middleware can call these):
 *
 * 1. Per-token: when a user logs out, the JWT's `jti` is written to Redis with
 *    a TTL covering the token's maximum lifetime. The proxy and getSession()
 *    reject any request bearing a blocked jti.
 * 2. Per-user: account deletion / password reset call revokeAllUserSessions(),
 *    which records a revocation timestamp for the user. Any token *issued
 *    before* that timestamp (token.iat) is rejected — this kills sessions on
 *    other devices whose jtis we can't enumerate.
 *
 * Falls back to process-local memory when Redis is not configured. That is
 * fine for single-process dev, but on multi-instance deployments (Vercel) the
 * fallback cannot revoke anything across instances — env.ts therefore requires
 * the Upstash variables in production.
 */

/** Maximum JWT session lifetime. Used for session.maxAge in the NextAuth
 *  config and as the TTL for revocation entries so they outlive any token
 *  they need to block. */
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

// ─── In-memory fallback ───────────────────────────────────────────────────────

const memoryBlocklist = new Set<string>();
const memoryUserRevocations = new Map<string, number>();

// ─── Redis singleton ──────────────────────────────────────────────────────────
// Create the client once and reuse it across all calls. Creating a new Redis
// instance on every request opens a new HTTP connection to Upstash and wastes
// resources on Vercel's serverless functions.

const BLOCKLIST_PREFIX = "session:blocked:";
const USER_REVOKED_PREFIX = "session:user-revoked:";

let _redisClient: import("@upstash/redis").Redis | null = null;

async function getRedisClient(): Promise<import("@upstash/redis").Redis> {
    if (_redisClient) return _redisClient;
    const { Redis } = await import("@upstash/redis");
    _redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    return _redisClient;
}

// ─── Public API ───────────────────────────────────────────────────────────────

const useRedis =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let warnedAboutRedis = false;

function warnIfMemoryFallback(): void {
    if (!warnedAboutRedis && process.env.NODE_ENV === "production") {
        warnedAboutRedis = true;
        console.warn(
            "[SESSION BLOCKLIST] UPSTASH_REDIS_REST_URL/TOKEN not set. " +
            "Using in-memory revocation — logout/revocation will NOT work " +
            "across instances or restarts."
        );
    }
}

/**
 * Add a JWT ID to the blocklist.
 * `ttlSeconds` defaults to the maximum session lifetime so the entry outlives
 * any token it needs to block, then auto-expires.
 */
export async function blockSession(jti: string, ttlSeconds: number = SESSION_MAX_AGE_SECONDS): Promise<void> {
    if (useRedis) {
        const redis = await getRedisClient();
        await redis.set(`${BLOCKLIST_PREFIX}${jti}`, "1", { ex: ttlSeconds });
    } else {
        warnIfMemoryFallback();
        memoryBlocklist.add(jti);
    }
}

/**
 * Returns true if the given JWT ID has been revoked.
 */
export async function isSessionBlocked(jti: string): Promise<boolean> {
    if (useRedis) {
        const redis = await getRedisClient();
        const val = await redis.get(`${BLOCKLIST_PREFIX}${jti}`);
        return val !== null;
    }
    return memoryBlocklist.has(jti);
}

/**
 * Revoke every session belonging to a user (all devices), by recording a
 * cutoff timestamp. Tokens issued before the cutoff are rejected by
 * isUserRevoked(). Call this on account deletion and password reset.
 */
export async function revokeAllUserSessions(userId: string, ttlSeconds: number = SESSION_MAX_AGE_SECONDS): Promise<void> {
    const cutoff = Date.now();
    if (useRedis) {
        const redis = await getRedisClient();
        await redis.set(`${USER_REVOKED_PREFIX}${userId}`, String(cutoff), { ex: ttlSeconds });
    } else {
        warnIfMemoryFallback();
        memoryUserRevocations.set(userId, cutoff);
    }
}

// ─── Single-use claims ────────────────────────────────────────────────────────

const memoryClaims = new Map<string, number>(); // key → expiry epoch ms

/**
 * Atomically claim a key for single use (Redis SET NX). Returns true on the
 * first claim and false for any repeat within the TTL. Used for TOTP replay
 * protection: a verified code's time-step counter is claimed so the same
 * code cannot authenticate twice.
 */
export async function claimOnce(key: string, ttlSeconds: number): Promise<boolean> {
    if (useRedis) {
        const redis = await getRedisClient();
        const result = await redis.set(`claim:${key}`, "1", { nx: true, ex: ttlSeconds });
        return result === "OK";
    }
    warnIfMemoryFallback();
    const now = Date.now();
    const existing = memoryClaims.get(key);
    if (existing !== undefined && existing > now) return false;
    memoryClaims.set(key, now + ttlSeconds * 1000);
    // Opportunistic cleanup to avoid unbounded growth in long-lived processes
    if (memoryClaims.size > 1000) {
        for (const [k, expiry] of memoryClaims) {
            if (expiry <= now) memoryClaims.delete(k);
        }
    }
    return true;
}

/**
 * Returns true if all of this user's sessions issued at or before
 * `issuedAtMs` have been revoked.
 */
export async function isUserRevoked(userId: string, issuedAtMs: number): Promise<boolean> {
    if (useRedis) {
        const redis = await getRedisClient();
        const val = await redis.get(`${USER_REVOKED_PREFIX}${userId}`);
        if (val === null || val === undefined) return false;
        return issuedAtMs <= Number(val);
    }
    const cutoff = memoryUserRevocations.get(userId);
    return cutoff !== undefined && issuedAtMs <= cutoff;
}
