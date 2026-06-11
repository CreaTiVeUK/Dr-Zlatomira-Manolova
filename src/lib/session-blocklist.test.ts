import { describe, it, expect } from "vitest";
import { blockSession, isSessionBlocked, revokeAllUserSessions, isUserRevoked, claimOnce } from "./session-blocklist";

// Exercises the in-memory fallback (no Upstash env in unit tests). The Redis
// paths use the same key semantics via SET / SET NX.

describe("session blocklist (memory fallback)", () => {
    it("blocks a jti after blockSession", async () => {
        expect(await isSessionBlocked("jti-abc")).toBe(false);
        await blockSession("jti-abc");
        expect(await isSessionBlocked("jti-abc")).toBe(true);
    });

    it("revokes only tokens issued before the cutoff", async () => {
        const before = Date.now() - 1000;
        await revokeAllUserSessions("user-9");
        const after = Date.now() + 1000;

        expect(await isUserRevoked("user-9", before)).toBe(true);
        expect(await isUserRevoked("user-9", after)).toBe(false);
        expect(await isUserRevoked("other-user", before)).toBe(false);
    });

    it("claimOnce grants a key exactly once within its TTL", async () => {
        expect(await claimOnce("totp:u1:12345", 120)).toBe(true);
        expect(await claimOnce("totp:u1:12345", 120)).toBe(false);
        expect(await claimOnce("totp:u1:12346", 120)).toBe(true);
    });
});
