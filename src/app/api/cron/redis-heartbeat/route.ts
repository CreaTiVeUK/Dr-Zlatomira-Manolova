/**
 * GET /api/cron/redis-heartbeat
 *
 * Writes one key to Upstash every day so the database is never idle.
 *
 * Upstash reclaims free-tier databases that see no commands for a stretch of
 * weeks. That happened on 2026-08-25 — the host stopped resolving and every
 * rate-limited route returned 500 — and the replacement created on
 * 2026-09-09 would go the same way: the only Redis traffic is rate limiting
 * and session revocation, and a practice website can go weeks without any.
 *
 * Deliberately does NOT use the resilience wrapper: if Redis is unreachable
 * this must fail loudly in the cron log, not fall back and report success.
 *
 * Protected by CRON_SECRET (fail-closed if the secret isn't configured).
 */

import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { REDIS_RETRY } from "@/lib/redis-guard";

export const dynamic = "force-dynamic";

const KEY = "heartbeat:last";
// Longer than the cron interval so the key itself proves the last run.
const TTL_SECONDS = 8 * 24 * 60 * 60;

export async function GET(request: NextRequest) {
    if (!env.CRON_SECRET) {
        console.error("[redis-heartbeat] CRON_SECRET not set — refusing to run");
        return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
    }
    if (request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
        return NextResponse.json({ ok: true, redis: "not_configured" });
    }

    try {
        const { Redis } = await import("@upstash/redis");
        const redis = new Redis({
            url: env.UPSTASH_REDIS_REST_URL,
            token: env.UPSTASH_REDIS_REST_TOKEN,
            retry: REDIS_RETRY,
        });
        const now = new Date().toISOString();
        const previous = await redis.get<string>(KEY);
        await redis.set(KEY, now, { ex: TTL_SECONDS });
        console.log(`[redis-heartbeat] ok — previous run ${previous ?? "none"}`);
        return NextResponse.json({ ok: true, at: now, previous });
    } catch (err) {
        console.error("[redis-heartbeat] FAILED — Upstash unreachable:", err);
        return NextResponse.json({ ok: false, error: "redis_unreachable" }, { status: 500 });
    }
}
