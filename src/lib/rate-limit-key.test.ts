import { describe, it, expect, afterEach, vi } from "vitest";
import { emailRateLimitKey } from "./rate-limit-key";

describe("emailRateLimitKey", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("never puts the address in the key", () => {
        vi.stubEnv("AUTH_SECRET", "x".repeat(32));
        const key = emailRateLimitKey("login", "parent@example.com");
        expect(key).not.toContain("parent");
        expect(key).not.toContain("example.com");
        expect(key).not.toContain("@");
        expect(key.startsWith("login:")).toBe(true);
    });

    it("is stable for the same address, so per-email limits still accumulate", () => {
        vi.stubEnv("AUTH_SECRET", "x".repeat(32));
        expect(emailRateLimitKey("login", "a@example.com")).toBe(emailRateLimitKey("login", "a@example.com"));
    });

    it("normalises case — one mailbox must not get two buckets", () => {
        vi.stubEnv("AUTH_SECRET", "x".repeat(32));
        expect(emailRateLimitKey("login", "A@Example.com")).toBe(emailRateLimitKey("login", "a@example.com"));
    });

    it("separates different addresses and different prefixes", () => {
        vi.stubEnv("AUTH_SECRET", "x".repeat(32));
        expect(emailRateLimitKey("login", "a@example.com")).not.toBe(emailRateLimitKey("login", "b@example.com"));
        expect(emailRateLimitKey("login", "a@example.com")).not.toBe(emailRateLimitKey("forgot", "a@example.com"));
    });

    it("is deployment-scoped — a different secret yields a different digest", () => {
        vi.stubEnv("AUTH_SECRET", "x".repeat(32));
        const withFirst = emailRateLimitKey("login", "a@example.com");
        vi.stubEnv("AUTH_SECRET", "y".repeat(32));
        expect(emailRateLimitKey("login", "a@example.com")).not.toBe(withFirst);
    });

    it("falls back to a per-address bucket when AUTH_SECRET is absent", () => {
        vi.stubEnv("AUTH_SECRET", "");
        // Correctness beats privacy here: collapsing every user into one shared
        // bucket would let one account's failures lock out everybody.
        expect(emailRateLimitKey("login", "a@example.com")).not.toBe(emailRateLimitKey("login", "b@example.com"));
    });
});
