export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, unknown>;
    error?: unknown;
}

const isProduction = process.env.NODE_ENV === 'production';

// Dynamically loaded Sentry module — never a hard dependency
let sentryImportAttempted = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sentry: any = null;

async function loadSentry() {
    if (sentryImportAttempted) return sentry;
    sentryImportAttempted = true;
    if (!process.env.SENTRY_DSN) return null;
    try {
        // Indirect import keeps TS from insisting @sentry/nextjs be installed.
        // The package is optional; users who want Sentry can `npm i @sentry/nextjs`.
        const moduleName = "@sentry/nextjs";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod = await (Function("m", "return import(m)")(moduleName) as Promise<any>).catch(() => null);
        if (mod) sentry = mod;
    } catch {
        /* ignore — optional dependency */
    }
    return sentry;
}

/**
 * Keys whose values must never reach an external error tracker.
 *
 * Call sites currently only pass record IDs, but the `error` object is
 * attacker- and library-controlled: a Prisma failure can echo query
 * parameters, and an OpenAI failure can echo request content — which here is a
 * verbatim paediatric consultation. Sentry is off (no SENTRY_DSN) but is one
 * env var away from live, so the scrub happens before anything leaves.
 *
 * Scope, so this isn't mistaken for more than it is: this covers the `extra`
 * payload on the Sentry forward. An Error passed to captureException is still
 * reported with its own message and stack, which Sentry reads directly —
 * rewriting those would mean fabricating a replacement Error and losing the
 * trace. Local console output is deliberately left intact; those logs are the
 * operator's own and scrubbing them would just make incidents harder to debug.
 */
const SENSITIVE_KEY = /pass|secret|token|cookie|auth|email|phone|name|notes|content|transcri|summary|address|dob|birth/i;
const MAX_STRING = 500;

function scrub(value: unknown, depth = 0): unknown {
    if (depth > 4) return "[depth-limit]";
    if (typeof value === "string") {
        return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…[truncated]` : value;
    }
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.slice(0, 20).map((v) => scrub(v, depth + 1));

    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
        out[key] = SENSITIVE_KEY.test(key) ? "[redacted]" : scrub(val, depth + 1);
    }
    return out;
}

export const logger = {
    info: (message: string, context?: Record<string, unknown>) => {
        log('info', message, context);
    },
    warn: (message: string, context?: Record<string, unknown>) => {
        log('warn', message, context);
    },
    error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
        log('error', message, context, error);
        // Fire-and-forget forward to Sentry. Never await — logging must not block.
        loadSentry().then((s) => {
            if (!s) return;
            try {
                const extra = scrub(context) as Record<string, unknown>;
                if (error instanceof Error) {
                    s.captureException(error, { extra });
                } else {
                    s.captureMessage(message, { level: "error", extra: { ...extra, error: scrub(error) } });
                }
            } catch { /* swallow */ }
        }).catch(() => { /* swallow */ });
    },
    debug: (message: string, context?: Record<string, unknown>) => {
        if (!isProduction) {
            log('debug', message, context);
        }
    }
};

function log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown) {
    const entry: LogEntry = {
        level,
        message,
        timestamp: new Date().toISOString(),
        context
    };

    if (error) {
        entry.error = serializeError(error);
    }

    // In production, you might pipe this to a service like Datadog/Sentry
    // For Vercel, console.log/error with JSON is automatically captured
    const output = JSON.stringify(entry);

    switch (level) {
        case 'error':
            console.error(output);
            break;
        case 'warn':
            console.warn(output);
            break;
        default:
            console.log(output);
    }
}

function serializeError(error: unknown) {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: (error as { cause?: unknown }).cause // Capture cause if present
        };
    }
    return error;
}
