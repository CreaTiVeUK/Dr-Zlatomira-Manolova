/**
 * Environment variable validation.
 *
 * Validated once at module load time so missing/malformed config crashes the
 * process immediately at startup rather than mid-request. Optional variables
 * control feature availability (e.g. RESEND_API_KEY → email sending) and are
 * permitted to be absent; required variables throw if missing.
 */

import { z } from "zod";

const schema = z.object({
    // ─── Required ────────────────────────────────────────────────────────────
    POSTGRES_PRISMA_URL: z.string().min(1, "required"),
    POSTGRES_URL_NON_POOLING: z.string().min(1, "required"),
    AUTH_SECRET: z.string().min(32, "must be ≥32 characters"),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // ─── Optional ────────────────────────────────────────────────────────────
    // OAuth providers
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    AUTH_FACEBOOK_ID: z.string().optional(),
    AUTH_FACEBOOK_SECRET: z.string().optional(),
    AUTH_APPLE_ID: z.string().optional(),
    AUTH_APPLE_SECRET: z.string().optional(),

    // Feature flags — missing var = feature disabled
    PII_ENCRYPTION_KEY: z.string().min(16, "must be ≥16 characters").optional(),
    RESEND_API_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    CRON_SECRET: z.string().min(16, "must be ≥16 characters").optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    SENTRY_DSN: z.string().url().optional(),

    // Email — required in production when RESEND_API_KEY is set.
    // APP_URL is the canonical site origin used in emailed links; EMAIL_FROM
    // must live on a domain verified in Resend (NOT *.vercel.app).
    APP_URL: z.string().url().optional(),
    EMAIL_FROM: z.string().email().optional(),
    CONTACT_EMAIL: z.string().email().optional(),

    // File storage — presence switches uploads to Vercel Blob (required on
    // Vercel, whose runtime filesystem is read-only)
    BLOB_READ_WRITE_TOKEN: z.string().optional(),

    // Deployment
    VERCEL_URL: z.string().optional(),

    // Escape hatch for CI's production-mode test server ONLY: acknowledges
    // that rate limiting / session revocation fall back to per-instance
    // memory. Never set this on a real deployment.
    ALLOW_IN_MEMORY_SECURITY_STORES: z.string().optional(),
});

function parseEnv() {
    // During `next build` (data collection phase) we don't want to require
    // runtime secrets like DB URLs to be present — the build container
    // shouldn't bake those in. Only enforce at actual runtime.
    const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
    const enforce = process.env.NODE_ENV === "production" && !isBuildPhase;

    const result = schema.safeParse(process.env);
    if (result.success) {
        // Redis is load-bearing in production: rate limiting AND session
        // revocation (logout, account deletion, password reset) silently
        // degrade to per-instance memory without it.
        const redisRequired = enforce && !result.data.ALLOW_IN_MEMORY_SECURITY_STORES;
        if (redisRequired && (!result.data.UPSTASH_REDIS_REST_URL || !result.data.UPSTASH_REDIS_REST_TOKEN)) {
            throw new Error(
                "Environment validation failed:\n" +
                "  UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN: required in production " +
                "(rate limiting and session revocation do not work across instances without Redis)"
            );
        }
        // If production email is on, the sender and link origin must be
        // explicit — VERCEL_URL points at individual deployments and Resend
        // cannot send from unverified domains.
        if (enforce && result.data.RESEND_API_KEY && (!result.data.EMAIL_FROM || !result.data.APP_URL)) {
            throw new Error(
                "Environment validation failed:\n" +
                "  EMAIL_FROM / APP_URL: required in production when RESEND_API_KEY is set " +
                "(EMAIL_FROM must be on a Resend-verified domain; APP_URL is the canonical site origin for emailed links)"
            );
        }
        return result.data;
    }

    const errors = result.error.flatten().fieldErrors;
    const lines = Object.entries(errors).map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`);
    const message = `Environment validation failed:\n${lines.join("\n")}`;

    if (enforce) {
        throw new Error(message);
    }
    // In dev or during build, log but don't crash. NOTE: .partial() still
    // validates *present* values (e.g. a too-short AUTH_SECRET in CI), so it
    // must be a safeParse — this path's contract is "never throw".
    console.warn(`⚠️  ${message}`);
    const partial = schema.partial().safeParse(process.env);
    if (partial.success) return partial.data as z.infer<typeof schema>;
    return process.env as unknown as z.infer<typeof schema>;
}

export const env = parseEnv();

// Feature availability — derived from env, usable without touching process.env elsewhere
export const features = {
    email: Boolean(env.RESEND_API_KEY),
    ai: Boolean(env.OPENAI_API_KEY),
    cron: Boolean(env.CRON_SECRET),
    redis: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
    blobStorage: Boolean(env.BLOB_READ_WRITE_TOKEN),
    piiEncryption: Boolean(env.PII_ENCRYPTION_KEY),
    sentry: Boolean(env.SENTRY_DSN),
    googleOAuth: Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET),
    facebookOAuth: Boolean(env.AUTH_FACEBOOK_ID && env.AUTH_FACEBOOK_SECRET),
    appleOAuth: Boolean(env.AUTH_APPLE_ID && env.AUTH_APPLE_SECRET),
};
