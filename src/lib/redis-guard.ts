/**
 * Resilience wrapper for the Upstash Redis calls behind rate limiting and
 * session revocation.
 *
 * Redis here is a security store, not a cache — but a store that is *gone*
 * must not take the site down with it. On 2026-08-25 the database behind
 * UPSTASH_REDIS_REST_URL stopped resolving (ENOTFOUND) and every route that
 * rate-limits — availability, booking, contact, registration, credential
 * login — returned 500, each request first burning ~5s inside the SDK's DNS
 * retry loop before failing.
 *
 * This module makes that failure degrade instead of break:
 *  - each call is bounded by REDIS_TIMEOUT_MS
 *  - after CIRCUIT_THRESHOLD consecutive failures the circuit opens for
 *    CIRCUIT_COOLDOWN_MS and calls skip Redis entirely, so requests stop
 *    paying the timeout at all
 *  - callers pass an explicit in-process fallback
 *
 * The security cost is real and deliberate: while the circuit is open, rate
 * limits are per-instance and session revocation cannot see entries written
 * by other instances. That is the accepted trade for staying reachable. It is
 * logged loudly and surfaced by /api/health.
 */

/** Upper bound on any single Redis round-trip. Upstash REST from Vercel is
 *  normally <100ms; anything past this is a fault, not slowness. */
const REDIS_TIMEOUT_MS = 1_500;

/** Consecutive failures before the circuit opens. */
const CIRCUIT_THRESHOLD = 3;

/** How long the circuit stays open before a single probe is allowed. */
const CIRCUIT_COOLDOWN_MS = 30_000;

let consecutiveFailures = 0;
let circuitOpenUntil = 0;

/** Retry policy handed to the Upstash clients. The SDK defaults to several
 *  attempts with backoff; against a dead host that only multiplies the stall,
 *  and `withRedisFallback` already owns the retry decision. */
export const REDIS_RETRY = { retries: 1, backoff: () => 0 } as const;

/** True when Redis has failed enough to be bypassed. Reported by /api/health
 *  so a degraded security posture is visible rather than silent. */
export function redisCircuitOpen(): boolean {
    return Date.now() < circuitOpenUntil;
}

function recordSuccess(): void {
    if (consecutiveFailures > 0 || circuitOpenUntil !== 0) {
        console.warn("[REDIS] recovered — resuming distributed rate limiting and revocation");
    }
    consecutiveFailures = 0;
    circuitOpenUntil = 0;
}

function recordFailure(label: string, err: unknown): void {
    consecutiveFailures++;
    if (consecutiveFailures >= CIRCUIT_THRESHOLD && !redisCircuitOpen()) {
        circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
        // Logged once per open rather than per request: during an outage this
        // path runs on every request and would otherwise flood the log.
        console.error(
            `[REDIS] circuit OPEN after ${consecutiveFailures} consecutive failures (${label}). ` +
            `Falling back to per-instance stores for ${CIRCUIT_COOLDOWN_MS / 1000}s — ` +
            "rate limits are no longer distributed and session revocation cannot see other instances.",
            err
        );
    } else if (!redisCircuitOpen()) {
        console.error(`[REDIS] ${label} failed (${consecutiveFailures}/${CIRCUIT_THRESHOLD}):`, err);
    }
}

/**
 * Run a Redis operation with a timeout, a circuit breaker, and a local
 * fallback. Never rejects — a store outage resolves to `fallback()`.
 *
 * `fallback` is invoked lazily so callers can express "what this instance
 * knows on its own" (an in-memory counter, an empty blocklist) without paying
 * for it on the happy path.
 */
export async function withRedisFallback<T>(
    label: string,
    op: () => Promise<T>,
    fallback: () => T
): Promise<T> {
    if (redisCircuitOpen()) return fallback();

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        const result = await Promise.race([
            op(),
            new Promise<never>((_, reject) => {
                timer = setTimeout(
                    () => reject(new Error(`Redis timeout after ${REDIS_TIMEOUT_MS}ms`)),
                    REDIS_TIMEOUT_MS
                );
            }),
        ]);
        recordSuccess();
        return result;
    } catch (err) {
        recordFailure(label, err);
        return fallback();
    } finally {
        if (timer) clearTimeout(timer);
    }
}
