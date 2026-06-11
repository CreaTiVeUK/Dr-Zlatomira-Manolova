import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// next-auth's index pulls in Next.js server internals — mock the only piece we use.
vi.mock("next-auth", () => ({
    CredentialsSignin: class CredentialsSignin extends Error {
        code = "credentials";
    },
}));

vi.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock("@/lib/rate-limit", () => ({
    rateLimit: vi.fn(async () => ({ success: true, remaining: 9 })),
}));

// Identity passthrough so TOTP secrets/backup codes round-trip in tests.
vi.mock("@/lib/encryption", () => ({
    encrypt: (v: string) => v,
    decrypt: (v: string) => v,
}));

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { generateSecret, generateCode } from "@/lib/totp";
import {
    authorizeUser,
    jwtCallback,
    sessionCallback,
    signInCallback,
    AccountLockedError,
    EmailNotVerifiedError,
    TotpRequiredError,
    TotpInvalidError,
    RateLimitedError,
    INACTIVITY_LIMIT_MS,
    type TokenShape,
} from "./auth-callbacks";

const findUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const update = prisma.user.update as ReturnType<typeof vi.fn>;
const create = prisma.user.create as ReturnType<typeof vi.fn>;
const rateLimitMock = rateLimit as ReturnType<typeof vi.fn>;

const PASSWORD = "Correct#Pass1";
// Low cost factor keeps the suite fast; production uses 12.
const PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 4);

function makeUser(overrides: Record<string, unknown> = {}) {
    return {
        id: "user-1",
        email: "patient@example.com",
        name: "Pat",
        role: "PATIENT",
        password: PASSWORD_HASH,
        emailVerified: new Date("2026-01-01"),
        failedAttempts: 0,
        lockedUntil: null,
        totpSecret: null,
        totpEnabledAt: null,
        totpBackupCodes: null,
        ...overrides,
    };
}

const CREDS = { email: "patient@example.com", password: PASSWORD };

beforeEach(() => {
    vi.clearAllMocks();
    rateLimitMock.mockResolvedValue({ success: true, remaining: 9 });
    update.mockResolvedValue({});
});

// ─── authorizeUser ───────────────────────────────────────────────────────────

describe("authorizeUser", () => {
    it("returns the user on valid credentials and resets lockout state", async () => {
        findUnique.mockResolvedValue(makeUser());

        const result = await authorizeUser(CREDS);

        expect(result).toEqual({ id: "user-1", email: "patient@example.com", name: "Pat", role: "PATIENT" });
        expect(update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ failedAttempts: 0, lockedUntil: null }),
        }));
    });

    it("returns null for malformed input", async () => {
        expect(await authorizeUser({ email: "not-an-email", password: "x" })).toBeNull();
        expect(findUnique).not.toHaveBeenCalled();
    });

    it("throws RateLimitedError when the per-email limit is exhausted", async () => {
        rateLimitMock.mockResolvedValue({ success: false, remaining: 0 });
        await expect(authorizeUser(CREDS)).rejects.toBeInstanceOf(RateLimitedError);
        expect(findUnique).not.toHaveBeenCalled();
    });

    it("returns null for unknown users but still runs a hash comparison", async () => {
        findUnique.mockResolvedValue(null);
        const compareSpy = vi.spyOn(bcrypt, "compare");

        expect(await authorizeUser(CREDS)).toBeNull();
        expect(compareSpy).toHaveBeenCalled();
        compareSpy.mockRestore();
    });

    it("increments failedAttempts on a wrong password", async () => {
        findUnique.mockResolvedValue(makeUser({ failedAttempts: 1 }));

        expect(await authorizeUser({ ...CREDS, password: "Wrong#Pass99" })).toBeNull();
        expect(update).toHaveBeenCalledWith(expect.objectContaining({
            data: { failedAttempts: 2, lockedUntil: null },
        }));
    });

    it("locks the account on the 5th wrong password", async () => {
        findUnique.mockResolvedValue(makeUser({ failedAttempts: 4 }));

        await expect(authorizeUser({ ...CREDS, password: "Wrong#Pass99" })).rejects.toBeInstanceOf(AccountLockedError);
        const data = update.mock.calls[0][0].data;
        expect(data.failedAttempts).toBe(5);
        expect(data.lockedUntil).toBeInstanceOf(Date);
    });

    it("restarts the counter (not instant re-lock) after a lockout expires", async () => {
        findUnique.mockResolvedValue(makeUser({
            failedAttempts: 5,
            lockedUntil: new Date(Date.now() - 1000), // expired
        }));

        expect(await authorizeUser({ ...CREDS, password: "Wrong#Pass99" })).toBeNull();
        expect(update).toHaveBeenCalledWith(expect.objectContaining({
            data: { failedAttempts: 1, lockedUntil: null },
        }));
    });

    it("does not reveal lock state to a caller with a wrong password", async () => {
        findUnique.mockResolvedValue(makeUser({
            failedAttempts: 5,
            lockedUntil: new Date(Date.now() + 10 * 60_000),
        }));

        expect(await authorizeUser({ ...CREDS, password: "Wrong#Pass99" })).toBeNull();
        expect(update).not.toHaveBeenCalled();
    });

    it("reveals the lockout only after a correct password", async () => {
        findUnique.mockResolvedValue(makeUser({
            failedAttempts: 5,
            lockedUntil: new Date(Date.now() + 10 * 60_000),
        }));

        await expect(authorizeUser(CREDS)).rejects.toBeInstanceOf(AccountLockedError);
    });

    it("requires email verification only after a correct password", async () => {
        findUnique.mockResolvedValue(makeUser({ emailVerified: null }));

        // Wrong password → generic null, not the verification error
        expect(await authorizeUser({ ...CREDS, password: "Wrong#Pass99" })).toBeNull();
        // Correct password → the state error may be shown
        await expect(authorizeUser(CREDS)).rejects.toBeInstanceOf(EmailNotVerifiedError);
    });

    it("skips the verification requirement for ADMIN accounts", async () => {
        findUnique.mockResolvedValue(makeUser({ emailVerified: null, role: "ADMIN" }));
        const result = await authorizeUser(CREDS);
        expect(result?.role).toBe("ADMIN");
    });

    describe("TOTP", () => {
        const secret = generateSecret();
        const totpUser = () => makeUser({ totpSecret: secret, totpEnabledAt: new Date("2026-01-01") });

        it("requires a code when 2FA is enabled", async () => {
            findUnique.mockResolvedValue(totpUser());
            await expect(authorizeUser(CREDS)).rejects.toBeInstanceOf(TotpRequiredError);
        });

        it("accepts a valid code", async () => {
            findUnique.mockResolvedValue(totpUser());
            const result = await authorizeUser({ ...CREDS, totp: generateCode(secret) });
            expect(result?.id).toBe("user-1");
        });

        it("counts invalid codes toward the lockout", async () => {
            findUnique.mockResolvedValue(totpUser());
            await expect(authorizeUser({ ...CREDS, totp: "000000" })).rejects.toBeInstanceOf(TotpInvalidError);
            expect(update).toHaveBeenCalledWith(expect.objectContaining({
                data: { failedAttempts: 1, lockedUntil: null },
            }));
        });

        it("locks the account after repeated invalid codes", async () => {
            findUnique.mockResolvedValue({ ...totpUser(), failedAttempts: 4 });
            await expect(authorizeUser({ ...CREDS, totp: "000000" })).rejects.toBeInstanceOf(AccountLockedError);
        });

        it("accepts and consumes a single-use backup code", async () => {
            findUnique.mockResolvedValue({
                ...totpUser(),
                totpBackupCodes: JSON.stringify(["AAAAA-BBBBB", "CCCCC-DDDDD"]),
            });

            const result = await authorizeUser({ ...CREDS, totp: "AAAAA-BBBBB" });
            expect(result?.id).toBe("user-1");
            expect(update).toHaveBeenCalledWith(expect.objectContaining({
                data: { totpBackupCodes: JSON.stringify(["CCCCC-DDDDD"]) },
            }));
        });
    });
});

// ─── jwtCallback ─────────────────────────────────────────────────────────────

describe("jwtCallback", () => {
    it("stamps id/role/jti/lastActivity on sign-in", async () => {
        const token = await jwtCallback({ token: {}, user: { id: "u1", role: "PATIENT" } });
        expect(token.id).toBe("u1");
        expect(token.role).toBe("PATIENT");
        expect(token.jti).toMatch(/[0-9a-f-]{36}/);
        expect(token.lastActivity).toBeGreaterThan(Date.now() - 1000);
    });

    it("refreshes lastActivity for an active session", async () => {
        const before = Date.now() - 60_000;
        const token = await jwtCallback({ token: { lastActivity: before } });
        expect(token.invalidated).toBeUndefined();
        expect(token.lastActivity).toBeGreaterThan(before);
    });

    it("invalidates a token idle past the limit WITHOUT refreshing it", async () => {
        const stale = Date.now() - INACTIVITY_LIMIT_MS - 1000;
        const token = await jwtCallback({ token: { lastActivity: stale } });
        expect(token.invalidated).toBe("inactivity");
        expect(token.lastActivity).toBe(stale);
    });

    it("keeps an invalidated token invalidated", async () => {
        const stale = Date.now() - INACTIVITY_LIMIT_MS - 1000;
        const token = await jwtCallback({ token: { lastActivity: stale, invalidated: "inactivity" } });
        expect(token.invalidated).toBe("inactivity");
        expect(token.lastActivity).toBe(stale);
    });

    it("clears invalidation on a fresh sign-in", async () => {
        const token = await jwtCallback({
            token: { invalidated: "inactivity", lastActivity: 1 },
            user: { id: "u1", role: "PATIENT" },
        });
        expect(token.invalidated).toBeUndefined();
    });
});

// ─── sessionCallback ─────────────────────────────────────────────────────────

describe("sessionCallback", () => {
    it("exposes jti, issuedAt (ms) and invalidated on the session", () => {
        const token: TokenShape = {
            id: "u1",
            role: "ADMIN",
            jti: "jti-123",
            iat: 1_700_000_000,
            lastActivity: 42,
            invalidated: "inactivity",
        };
        const session = sessionCallback({ session: { user: {} }, token });

        expect(session.user?.id).toBe("u1");
        expect(session.user?.role).toBe("ADMIN");
        expect(session.jti).toBe("jti-123");
        expect(session.issuedAt).toBe(1_700_000_000_000);
        expect(session.invalidated).toBe("inactivity");
    });
});

// ─── signInCallback ──────────────────────────────────────────────────────────

describe("signInCallback", () => {
    it("passes credentials sign-ins through untouched", async () => {
        const ok = await signInCallback({ user: { id: "u1" }, account: { provider: "credentials" } });
        expect(ok).toBe(true);
        expect(findUnique).not.toHaveBeenCalled();
    });

    it("creates a new user for first-time OAuth sign-in", async () => {
        findUnique.mockResolvedValue(null);
        create.mockResolvedValue({ id: "new-id", role: "PATIENT" });

        const user = { email: "new@example.com", name: "New", image: null } as { id?: string; email: string; name: string; image: null };
        const ok = await signInCallback({ user, account: { provider: "google" } });

        expect(ok).toBe(true);
        expect(user.id).toBe("new-id");
    });

    it("REFUSES to auto-link to an existing password-protected account", async () => {
        findUnique.mockResolvedValue(makeUser());

        const result = await signInCallback({
            user: { email: "patient@example.com" },
            account: { provider: "google" },
        });

        expect(result).toBe("/login?error=AccountNotLinked");
        expect(create).not.toHaveBeenCalled();
        expect(update).not.toHaveBeenCalled();
    });

    it("links OAuth sign-ins to existing OAuth-only accounts", async () => {
        findUnique.mockResolvedValue(makeUser({ password: null }));

        const user = { email: "patient@example.com" } as { id?: string; email: string };
        const ok = await signInCallback({ user, account: { provider: "google" } });

        expect(ok).toBe(true);
        expect(user.id).toBe("user-1");
    });

    it("rejects OAuth sign-ins without an email", async () => {
        const ok = await signInCallback({ user: {}, account: { provider: "google" } });
        expect(ok).toBe(false);
    });
});
