/**
 * POST /api/auth/reset-password
 *
 * Validates a password reset token and updates the user's password.
 * - Enforces the same strength rules as registration.
 * - Resets lockout fields so a previously-locked account becomes usable.
 * - Deletes the token after successful use (one-time use).
 * - Rate-limited to 5 requests per IP per minute.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { createAuditLog, AuditAction } from "@/lib/audit";
import { checkPasswordStrength } from "@/lib/password-strength";
import { revokeAllUserSessions } from "@/lib/session-blocklist";

const schema = z.object({
    token: z.string().min(1),
    email: z.string().email().transform((v) => sanitizeString(v).toLowerCase()),
    password: z.string().min(1).max(128),
});

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const ipLimiter = await rateLimit(`reset:ip:${ip}`, 5, 60_000);

    if (!ipLimiter.success) {
        return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    try {
        const body = await request.json();
        const result = schema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Invalid request." }, { status: 400 });
        }

        const { token, email, password } = result.data;

        // Per-email bucket (10/hour) — protects against a botnet brute-forcing
        // token guesses for a single victim account across rotating IPs.
        const emailLimiter = await rateLimit(`reset:email:${email}`, 10, 60 * 60_000);
        if (!emailLimiter.success) {
            return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
        }

        const strength = checkPasswordStrength(password, [email]);
        if (!strength.valid) {
            return NextResponse.json({ error: strength.reason }, { status: 400 });
        }

        // Look up the reset token
        const resetToken = await prisma.passwordResetToken.findFirst({
            where: { identifier: email, token },
        });

        if (!resetToken) {
            return NextResponse.json({ error: "invalid_token" }, { status: 400 });
        }

        if (resetToken.expires < new Date()) {
            // Clean up the expired token
            await prisma.passwordResetToken.deleteMany({ where: { identifier: email } });
            return NextResponse.json({ error: "expired_token" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, emailVerified: true },
        });

        if (!user) {
            return NextResponse.json({ error: "invalid_token" }, { status: 400 });
        }

        const hashedPassword = await hash(password, 12);

        // Update password and reset any lockout state in a single transaction.
        // Completing the reset proves mailbox ownership, so it also counts as
        // email verification for accounts that never clicked the verify link.
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    failedAttempts: 0,
                    lockedUntil: null,
                    emailVerified: user.emailVerified ?? new Date(),
                },
            }),
            prisma.passwordResetToken.deleteMany({ where: { identifier: email } }),
        ]);

        // Kill sessions on all devices — anyone holding the old credentials
        // (the reason for most resets) must not keep a live session.
        await revokeAllUserSessions(user.id);

        await createAuditLog(user.id, AuditAction.PASSWORD_RESET_COMPLETE, "Password reset completed", ip);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[reset-password] Error:", error);
        return NextResponse.json({ error: "An error occurred. Please try again." }, { status: 500 });
    }
}
