/**
 * Rate limiter with Redis backend (Upstash) and in-memory fallback.
 *
 * - When UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set → distributed,
 *   sliding-window rate limiting via Upstash Redis (safe for multi-instance / Vercel).
 * - Otherwise → in-memory Map (single-process; not suitable for horizontal scaling).
 */

import type { Ratelimit as RatelimitType } from "@upstash/ratelimit";

// ─── In-memory fallback ────────────────────────────────────────────────────────

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const memoryStore = new Map<string, RateLimitEntry>();

// Purge expired entries every minute to prevent unbounded memory growth.
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of memoryStore.entries()) {
            if (now > entry.resetTime) memoryStore.delete(key);
        }
    }, 60_000);
}

function memoryRateLimit(
    ip: string,
    limit: number,
    windowMs: number
): { success: boolean; remaining: number } {
    const now = Date.now();
    const entry = memoryStore.get(ip);

    if (!entry || now > entry.resetTime) {
        memoryStore.set(ip, { count: 1, resetTime: now + windowMs });
        return { success: true, remaining: limit - 1 };
    }

    entry.count++;
    if (entry.count > limit) return { success: false, remaining: 0 };
    return { success: true, remaining: limit - entry.count };
}

// ─── Upstash Redis rate limiter ───────────────────────────────────────────────

// Cache Ratelimit instances per (limit, windowSeconds) to avoid re-creating them.
const upstashLimiters = new Map<string, RatelimitType>();

async function upstashRateLimit(
    identifier: string,
    limit: number,
    windowMs: number
): Promise<{ success: boolean; remaining: number }> {
    const { Ratelimit } = await import("@upstash/ratelimit");
    const { Redis } = await import("@upstash/redis");

    const cacheKey = `${limit}:${windowMs}`;
    if (!upstashLimiters.has(cacheKey)) {
        const windowSeconds = Math.ceil(windowMs / 1000);
        const limiter = new Ratelimit({
            redis: new Redis({
                url: process.env.UPSTASH_REDIS_REST_URL!,
                token: process.env.UPSTASH_REDIS_REST_TOKEN!,
            }),
            limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
            analytics: false,
        });
        upstashLimiters.set(cacheKey, limiter);
    }

    const result = await upstashLimiters.get(cacheKey)!.limit(identifier);
    return { success: result.success, remaining: result.remaining };
}

// ─── Public API ───────────────────────────────────────────────────────────────

const useRedis =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let warnedAboutRedis = false;

export async function rateLimit(
    ip: string,
    limit: number = 5,
    windowMs: number = 60_000
): Promise<{ success: boolean; remaining: number }> {
    if (useRedis) {
        return upstashRateLimit(ip, limit, windowMs);
    }
    if (!warnedAboutRedis && process.env.NODE_ENV === "production") {
        warnedAboutRedis = true;
        console.warn(
            "[RATE LIMIT] UPSTASH_REDIS_REST_URL/TOKEN not set. " +
            "Using in-memory rate limiting — not safe for multi-instance deployments."
        );
    }
    return memoryRateLimit(ip, limit, windowMs);
}
