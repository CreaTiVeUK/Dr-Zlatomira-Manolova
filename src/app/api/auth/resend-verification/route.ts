/**
 * POST /api/auth/resend-verification
 *
 * Resends the email verification link for an unverified account.
 * Rate-limited to prevent abuse. Returns a generic success response
 * regardless of whether the email exists to prevent enumeration.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { sendEmail, EMAIL_TEMPLATES } from "@/lib/email";

const schema = z.object({
    email: z.string().email().transform((v) => sanitizeString(v).toLowerCase()),
});

const GENERIC_RESPONSE = NextResponse.json(
    { success: true, message: "If that address is registered and unverified, a new link has been sent." },
    { status: 200 }
);

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = await rateLimit(ip, 3, 60_000); // 3 per minute — tighter than register

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
            select: { id: true, name: true, emailVerified: true },
        });

        // Return generic response regardless of whether user exists
        if (!user || user.emailVerified) return GENERIC_RESPONSE;

        // Delete any existing tokens for this email before creating a new one
        await prisma.verificationToken.deleteMany({ where: { identifier: email } });

        const token = randomBytes(24).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.verificationToken.create({
            data: { identifier: email, token, expires },
        });

        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000";
        const verifyUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

        sendEmail(email, EMAIL_TEMPLATES.EMAIL_VERIFICATION(user.name ?? email, verifyUrl)).catch((err) => {
            console.error("[resend-verification] Failed to send email:", err);
        });

        return GENERIC_RESPONSE;
    } catch (error) {
        console.error("[resend-verification] Error:", error);
        return GENERIC_RESPONSE; // Still generic to prevent info leakage
    }
}
