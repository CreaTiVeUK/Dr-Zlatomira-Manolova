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

    // Deployment
    VERCEL_URL: z.string().optional(),
});

function parseEnv() {
    const result = schema.safeParse(process.env);
    if (result.success) return result.data;

    const errors = result.error.flatten().fieldErrors;
    const lines = Object.entries(errors).map(([key, msgs]) => `  ${key}: ${msgs?.join(", ")}`);
    const message = `Environment validation failed:\n${lines.join("\n")}`;

    if (process.env.NODE_ENV === "production") {
        throw new Error(message);
    }
    // In dev, log but don't crash — lets developers run the app while wiring config
    console.warn(`⚠️  ${message}`);
    return schema.partial().parse(process.env) as z.infer<typeof schema>;
}

export const env = parseEnv();

// Feature availability — derived from env, usable without touching process.env elsewhere
export const features = {
    email: Boolean(env.RESEND_API_KEY),
    ai: Boolean(env.OPENAI_API_KEY),
    cron: Boolean(env.CRON_SECRET),
    redis: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
    piiEncryption: Boolean(env.PII_ENCRYPTION_KEY),
    sentry: Boolean(env.SENTRY_DSN),
    googleOAuth: Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET),
    facebookOAuth: Boolean(env.AUTH_FACEBOOK_ID && env.AUTH_FACEBOOK_SECRET),
    appleOAuth: Boolean(env.AUTH_APPLE_ID && env.AUTH_APPLE_SECRET),
};
