/**
 * Session revocation via Redis token blocklist.
 *
 * When a user logs out (or an admin force-revokes a session), the JWT's `jti`
 * (JWT ID) is written to Redis with a TTL matching the token's remaining
 * lifetime. The proxy checks every authenticated request — if the jti is in
 * Redis the request is rejected immediately.
 *
 * Falls back gracefully when Redis is not configured (in-memory Set).
 * In production with multi-instance deployments (Vercel) Redis is required.
 */

// ─── In-memory fallback ───────────────────────────────────────────────────────

const memoryBlocklist = new Set<string>();

function memoryBlock(jti: string): void {
    memoryBlocklist.add(jti);
}

function memoryIsBlocked(jti: string): boolean {
    return memoryBlocklist.has(jti);
}

// ─── Redis implementation ─────────────────────────────────────────────────────

const BLOCKLIST_PREFIX = "session:blocked:";

async function redisBlock(jti: string, ttlSeconds: number): Promise<void> {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    await redis.set(`${BLOCKLIST_PREFIX}${jti}`, "1", { ex: ttlSeconds });
}

async function redisIsBlocked(jti: string): Promise<boolean> {
    const { Redis } = await import("@upstash/redis");
    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    const val = await redis.get(`${BLOCKLIST_PREFIX}${jti}`);
    return val !== null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

const useRedis =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

/**
 * Add a JWT ID to the blocklist.
 * `ttlSeconds` should be the token's remaining lifetime so the entry
 * auto-expires rather than growing indefinitely.
 */
export async function blockSession(jti: string, ttlSeconds: number = 3600): Promise<void> {
    if (useRedis) {
        await redisBlock(jti, ttlSeconds);
    } else {
        memoryBlock(jti);
    }
}

/**
 * Returns true if the given JWT ID has been revoked.
 */
export async function isSessionBlocked(jti: string): Promise<boolean> {
    if (useRedis) {
        return redisIsBlocked(jti);
    }
    return memoryIsBlocked(jti);
}
