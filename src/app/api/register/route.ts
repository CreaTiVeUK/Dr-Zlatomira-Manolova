import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { encrypt } from "@/lib/encryption";
import { sendEmail, EMAIL_TEMPLATES } from "@/lib/email";

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").transform(v => sanitizeString(v)),
    email: z.string().email("Invalid email address").transform(v => sanitizeString(v).toLowerCase()),
    password: passwordSchema,
    phone: z.string().optional().transform(v => v ? sanitizeString(v) : v),
});

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limiter = await rateLimit(ip, 10, 60000);

    if (!limiter.success) {
        return NextResponse.json(
            { error: "Too many registration attempts. Please wait." },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const result = registerSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid input", details: result.error.format() },
                { status: 400 }
            );
        }

        const { name, email, password, phone } = result.data;

        // Generic error prevents email enumeration
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json(
                { error: "Registration failed. Please check your details and try again." },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // Encrypt PII before storing
        const encryptedPhone = phone ? encrypt(phone) : undefined;

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone: encryptedPhone,
                role: "PATIENT",
                // emailVerified remains null until the user clicks the verification link
            },
        });

        // Generate a secure email verification token (48 hex chars = 192 bits)
        const token = randomBytes(24).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.verificationToken.create({
            data: { identifier: email, token, expires },
        });

        // Send verification email (non-blocking — registration still succeeds)
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000";
        const verifyUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

        sendEmail(email, EMAIL_TEMPLATES.EMAIL_VERIFICATION(name, verifyUrl)).catch((err) => {
            console.error("Failed to send verification email:", err);
        });

        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: "REGISTER_SUCCESS",
                details: "User registered successfully",
                ip,
            },
        });

        return NextResponse.json(
            { success: true, message: "Registration successful. Please check your email to verify your account." },
            { status: 201 }
        );

    } catch (error: unknown) {
        console.error("Registration Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
