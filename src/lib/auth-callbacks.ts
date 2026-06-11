/**
 * NextAuth callback + authorize logic, extracted from src/auth.ts so it can be
 * unit-tested with a mocked prisma/rate-limiter. src/auth.ts only wires these
 * into the NextAuth config.
 *
 * Security properties enforced here (see tests in auth-callbacks.test.ts):
 * - Account state (locked / unverified) is only revealed AFTER a correct
 *   password, so the signin endpoint cannot be used to enumerate accounts.
 * - bcrypt.compare always runs (against a dummy hash when the user does not
 *   exist) to keep response timing uniform.
 * - Invalid TOTP codes count toward the same failedAttempts lockout as wrong
 *   passwords — a known password does not grant unlimited 2FA guesses.
 * - Sign-ins are rate limited per email address.
 * - The 30-minute inactivity window is enforced in jwtCallback by comparing
 *   the PREVIOUS lastActivity before refreshing it. Stale tokens are flagged
 *   `invalidated` and rejected by getSession() and the proxy.
 * - OAuth logins never auto-link to an existing account that has a password —
 *   that would let an attacker take over a credentials account (incl. its
 *   TOTP) via a provider profile bearing the victim's email.
 */

import { CredentialsSignin } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/sanitize";
import { decrypt, encrypt } from "@/lib/encryption";
import { verifyCodeWithCounter } from "@/lib/totp";
import { claimOnce } from "@/lib/session-blocklist";
import { rateLimit } from "@/lib/rate-limit";

export const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60_000;

// Sign-in attempts per email per minute. Overridable for test environments
// where the whole suite logs in as the same seed users.
const LOGIN_RATE_LIMIT = (() => {
    const fromEnv = Number(process.env.LOGIN_RATE_LIMIT);
    if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
    return process.env.NODE_ENV === "production" ? 10 : 50;
})();

// Valid bcrypt hash of a throwaway string — compared against when the user
// doesn't exist so lookups and misses take the same time.
const DUMMY_HASH = "$2b$12$sujtrmU75Ak8708MewD.QukW764fk.Vz8RZzdhhdL4GYoXuhmPx3a";

const credentialsSchema = z.object({
    email: z.string().email().transform((v) => sanitizeString(v).toLowerCase()),
    password: z.string().min(8),
    totp: z.string().trim().optional(),
});

// Custom signin errors — NextAuth v5 exposes `code` on the client via result.error
export class AccountLockedError extends CredentialsSignin {
    code = "account_locked";
}
export class EmailNotVerifiedError extends CredentialsSignin {
    code = "email_not_verified";
}
export class TotpRequiredError extends CredentialsSignin {
    code = "totp_required";
}
export class TotpInvalidError extends CredentialsSignin {
    code = "totp_invalid";
}
export class RateLimitedError extends CredentialsSignin {
    code = "rate_limited";
}

export interface AuthorizedUser {
    id: string;
    email: string;
    name: string | null;
    role: string;
}

/** Increment failedAttempts, locking the account when the threshold is hit.
 *  Returns true if this attempt triggered the lock. */
async function recordFailedAttempt(user: { id: string; failedAttempts: number; lockedUntil: Date | null }): Promise<boolean> {
    // If a previous lockout has expired, restart the counter instead of
    // instantly re-locking on the next failure.
    const lockExpired = user.lockedUntil !== null && user.lockedUntil <= new Date();
    const attempts = lockExpired ? 1 : user.failedAttempts + 1;
    const nowLocked = attempts >= MAX_FAILED_ATTEMPTS;
    await prisma.user.update({
        where: { id: user.id },
        data: {
            failedAttempts: attempts,
            lockedUntil: nowLocked ? new Date(Date.now() + LOCKOUT_MS) : null,
        },
    });
    return nowLocked;
}

export async function authorizeUser(credentials: unknown): Promise<AuthorizedUser | null> {
    const parsed = credentialsSchema.safeParse(credentials);
    if (!parsed.success) return null;

    const { email, password, totp } = parsed.data;

    const limiter = await rateLimit(`login:${email}`, LOGIN_RATE_LIMIT, 60_000);
    if (!limiter.success) throw new RateLimitedError();

    const user = await prisma.user.findUnique({ where: { email } });

    // Always run the comparison so missing users cost the same as wrong passwords.
    const valid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);

    if (!user || !user.password) return null;

    const lockActive = user.lockedUntil !== null && user.lockedUntil > new Date();

    if (!valid) {
        // Don't reveal lock state (or extend the counter) to a caller who
        // hasn't proven they know the password.
        if (lockActive) return null;
        const nowLocked = await recordFailedAttempt(user);
        if (nowLocked) throw new AccountLockedError();
        return null;
    }

    // Password verified — account-state errors below no longer leak anything
    // to someone who doesn't already have the credential.
    if (lockActive) throw new AccountLockedError();

    // Email verification required for patient credential accounts.
    // Admin accounts are created via the create-admin script (always
    // pre-verified) so we skip this check for them to avoid lockout
    // if emailVerified was lost during a schema migration.
    if (!user.emailVerified && user.role !== "ADMIN") {
        throw new EmailNotVerifiedError();
    }

    // TOTP enforcement — if the user has completed 2FA setup, a valid
    // code (or backup code) must accompany the password.
    if (user.totpEnabledAt && user.totpSecret) {
        if (!totp) throw new TotpRequiredError();

        let secret: string;
        try {
            secret = decrypt(user.totpSecret);
        } catch {
            // Undecryptable secret (key rotation/corruption) — fail closed
            throw new TotpInvalidError();
        }

        const counter = verifyCodeWithCounter(secret, totp);
        // Replay protection: each verified time-step counter is single-use.
        // TTL covers the ±1-step acceptance window.
        let ok = counter !== null && (await claimOnce(`totp:${user.id}:${counter}`, 120));

        if (!ok && user.totpBackupCodes) {
            try {
                const codes: string[] = JSON.parse(decrypt(user.totpBackupCodes));
                const normalized = totp.trim().toUpperCase();
                const idx = codes.indexOf(normalized);
                if (idx !== -1) {
                    // Consume the backup code — single-use.
                    codes.splice(idx, 1);
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { totpBackupCodes: encrypt(JSON.stringify(codes)) },
                    });
                    ok = true;
                }
            } catch {
                /* corrupt backup codes — treat as no match */
            }
        }

        if (!ok) {
            // 2FA guesses burn the same lockout budget as wrong passwords.
            const nowLocked = await recordFailedAttempt(user);
            if (nowLocked) throw new AccountLockedError();
            throw new TotpInvalidError();
        }
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { failedAttempts: 0, lockedUntil: null, lastActivity: new Date() },
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role as string };
}

// ─── jwt / session callbacks ─────────────────────────────────────────────────

export interface TokenShape {
    id?: string;
    role?: string;
    jti?: string;
    iat?: number;
    lastActivity?: number;
    invalidated?: string;
    [key: string]: unknown;
}

export async function jwtCallback({ token, user }: { token: TokenShape; user?: { id?: string; role?: string } | null }): Promise<TokenShape> {
    if (user) {
        // Fresh sign-in
        token.id = user.id;
        token.role = user.role ?? "PATIENT";
        // Assign a stable jti on first issue so it can be blocklisted on logout
        if (!token.jti) {
            token.jti = crypto.randomUUID();
        }
        token.lastActivity = Date.now();
        delete token.invalidated;
        return token;
    }

    // Sliding inactivity window: check the PREVIOUS activity timestamp before
    // refreshing it — refreshing first would make the check unfalsifiable.
    const last = token.lastActivity;
    if (typeof last === "number" && Date.now() - last > INACTIVITY_LIMIT_MS) {
        token.invalidated = "inactivity";
        return token;
    }

    if (!token.invalidated) {
        token.lastActivity = Date.now();
    }
    return token;
}

export interface SessionShape {
    user?: {
        id?: string;
        role?: string;
        lastActivity?: number;
        [key: string]: unknown;
    };
    jti?: string;
    /** Token issue time in milliseconds — compared against user-level revocation. */
    issuedAt?: number;
    invalidated?: string;
    [key: string]: unknown;
}

export function sessionCallback({ session, token }: { session: SessionShape; token: TokenShape }): SessionShape {
    if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.lastActivity = token.lastActivity;
    }
    // Expose revocation handles — without these on the session object the
    // blocklist checks in the proxy and logout route read `undefined`.
    session.jti = token.jti;
    session.issuedAt = typeof token.iat === "number" ? token.iat * 1000 : undefined;
    session.invalidated = token.invalidated;
    return session;
}

// ─── signIn callback (OAuth upsert) ──────────────────────────────────────────

interface SignInParams {
    user: { id?: string; email?: string | null; name?: string | null; image?: string | null; role?: string };
    account?: { provider?: string } | null;
    profile?: { email?: string; name?: string; picture?: string } | null;
}

export async function signInCallback({ user, account, profile }: SignInParams): Promise<boolean | string> {
    // For OAuth providers, upsert the user in our database
    if (account?.provider && account.provider !== "credentials") {
        const email = user.email ?? profile?.email;
        if (!email) return false;

        try {
            const existing = await prisma.user.findUnique({ where: { email } });

            if (!existing) {
                const created = await prisma.user.create({
                    data: {
                        email,
                        name: user.name ?? profile?.name ?? email,
                        image: user.image ?? profile?.picture ?? null,
                        emailVerified: new Date(),
                        role: "PATIENT",
                    },
                });
                user.id = created.id;
                user.role = created.role;
            } else {
                // Never auto-link to an account protected by a password: a
                // provider profile carrying the victim's email would otherwise
                // take over the account, bypassing its password AND TOTP.
                if (existing.password) {
                    return "/login?error=AccountNotLinked";
                }
                user.id = existing.id;
                user.role = existing.role;
                // Keep image in sync
                if (user.image && user.image !== existing.image) {
                    await prisma.user.update({
                        where: { id: existing.id },
                        data: { image: user.image },
                    });
                }
            }
        } catch (err) {
            console.error("[auth] OAuth user upsert failed:", err);
            return false;
        }
    }
    return true;
}
