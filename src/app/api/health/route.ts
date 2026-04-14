/**
 * GET /api/health
 *
 * Lightweight health check for uptime monitors, load balancers, and
 * Vercel-native checks. Returns 200 when the core dependencies respond, 503
 * otherwise. Response body includes a per-component breakdown.
 *
 * Never returns secrets. Never authenticated — must be publicly reachable.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { features } from "@/lib/env";

export const dynamic = "force-dynamic";

interface CheckResult {
    ok: boolean;
    latencyMs?: number;
    error?: string;
}

async function checkDatabase(): Promise<CheckResult> {
    const start = Date.now();
    try {
        await prisma.$queryRaw`SELECT 1`;
        return { ok: true, latencyMs: Date.now() - start };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "unknown" };
    }
}

async function checkRedis(): Promise<CheckResult> {
    if (!features.redis) return { ok: true, error: "not_configured" };
    const start = Date.now();
    try {
        const { Redis } = await import("@upstash/redis");
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
        await redis.ping();
        return { ok: true, latencyMs: Date.now() - start };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "unknown" };
    }
}

export async function GET() {
    const [db, redis] = await Promise.all([checkDatabase(), checkRedis()]);

    // Redis reporting "not_configured" is informational, not a failure.
    const redisOk = redis.ok || redis.error === "not_configured";
    const healthy = db.ok && redisOk;

    const body = {
        status: healthy ? "ok" : "degraded",
        timestamp: new Date().toISOString(),
        checks: {
            database: db,
            redis,
        },
        features: {
            email: features.email,
            ai: features.ai,
            cron: features.cron,
            redis: features.redis,
            piiEncryption: features.piiEncryption,
            sentry: features.sentry,
        },
    };

    return NextResponse.json(body, { status: healthy ? 200 : 503 });
}
