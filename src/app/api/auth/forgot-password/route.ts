/**
 * POST /api/auth/forgot-password
 *
 * Initiates password reset: generates a short-lived token, stores it, and
 * emails a reset link. Always returns a generic 200 regardless of whether
 * the email is registered — prevents user enumeration.
 *
 * Rate-limited to 3 requests per IP per minute.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { sendEmail, EMAIL_TEMPLATES } from "@/lib/email";
import { createAuditLog, AuditAction } from "@/lib/audit";

const schema = z.object({
    email: z.string().email().transform((v) => sanitizeString(v).toLowerCase()),
});

// Always return the same response to prevent user enumeration
const GENERIC_RESPONSE = NextResponse.json(
    { success: true, message: "If that address is registered, a reset link has been sent." },
    { status: 200 }
);

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = await rateLimit(ip, 3, 60_000);

    if (!limiter.success) {
        return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
    }

    try {
        const body = await request.json();
        const result = schema.safeParse(body);
        if (!result.success) return GENERIC_RESPONSE;

        const { email } = result.data;

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, password: true },
        });

        // Only allow reset for credential accounts (not OAuth-only accounts)
        if (!user || !user.password) return GENERIC_RESPONSE;

        // Delete any existing reset tokens for this email
        await prisma.passwordResetToken.deleteMany({ where: { identifier: email } });

        const token = randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.passwordResetToken.create({
            data: { identifier: email, token, expires },
        });

        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000";
        const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

        sendEmail(email, EMAIL_TEMPLATES.PASSWORD_RESET(resetUrl)).catch((err) => {
            console.error("[forgot-password] Failed to send email:", err);
        });

        // Audit log — use system user ID representation for unauthenticated actions
        createAuditLog(user.id, AuditAction.PASSWORD_RESET_REQUEST, `Password reset requested`, ip).catch(() => {});

        return GENERIC_RESPONSE;
    } catch (error) {
        console.error("[forgot-password] Error:", error);
        return GENERIC_RESPONSE;
    }
}
