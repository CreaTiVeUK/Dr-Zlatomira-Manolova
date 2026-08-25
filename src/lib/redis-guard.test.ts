/**
 * Covers the behaviour that turned a dead Upstash database into a site-wide
 * outage on 2026-08-25: a rejected Redis call must resolve to the caller's
 * fallback, and repeated failures must stop the app calling Redis at all.
 *
 * Module state (failure count, circuit deadline) is process-global by design,
 * so each test re-imports the module to start clean.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type Guard = typeof import("./redis-guard");

async function freshGuard(): Promise<Guard> {
    vi.resetModules();
    return import("./redis-guard");
}

describe("withRedisFallback", () => {
    beforeEach(() => {
        // The guard logs every failure and every circuit transition.
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("returns the operation's value when Redis is healthy", async () => {
        const { withRedisFallback } = await freshGuard();
        const fallback = vi.fn(() => "fallback");

        const result = await withRedisFallback("test", async () => "live", fallback);

        expect(result).toBe("live");
        expect(fallback).not.toHaveBeenCalled();
    });

    it("resolves to the fallback instead of rejecting when the call fails", async () => {
        const { withRedisFallback } = await freshGuard();
        const err = Object.assign(new Error("fetch failed"), { code: "ENOTFOUND" });

        const result = await withRedisFallback(
            "test",
            async () => { throw err; },
            () => "fallback"
        );

        expect(result).toBe("fallback");
    });

    it("opens the circuit after three consecutive failures and stops calling Redis", async () => {
        const { withRedisFallback, redisCircuitOpen } = await freshGuard();
        const op = vi.fn(async () => { throw new Error("ENOTFOUND"); });

        for (let i = 0; i < 3; i++) {
            await withRedisFallback("test", op, () => "fallback");
        }
        expect(redisCircuitOpen()).toBe(true);
        expect(op).toHaveBeenCalledTimes(3);

        // Further calls short-circuit: the operation is never attempted, so
        // requests no longer pay the timeout.
        const result = await withRedisFallback("test", op, () => "fallback");
        expect(result).toBe("fallback");
        expect(op).toHaveBeenCalledTimes(3);
    });

    it("resets the failure count when a call succeeds", async () => {
        const { withRedisFallback, redisCircuitOpen } = await freshGuard();
        const failing = async () => { throw new Error("ENOTFOUND"); };

        await withRedisFallback("test", failing, () => "fallback");
        await withRedisFallback("test", failing, () => "fallback");
        await withRedisFallback("test", async () => "live", () => "fallback");
        await withRedisFallback("test", failing, () => "fallback");

        // Two failures, a success, then one more — never three in a row.
        expect(redisCircuitOpen()).toBe(false);
    });

    it("falls back when the call hangs past the timeout", async () => {
        const { withRedisFallback } = await freshGuard();
        vi.useFakeTimers();

        const pending = withRedisFallback(
            "test",
            () => new Promise<string>(() => {}), // never settles
            () => "fallback"
        );
        await vi.advanceTimersByTimeAsync(2_000);

        expect(await pending).toBe("fallback");
    });
});
