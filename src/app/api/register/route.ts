import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").transform(v => sanitizeString(v)),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limiter = rateLimit(ip, 10, 60000); // Stricter limit for registration

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

        // Check existing user
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists." }, // User exists
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                role: "PATIENT", // Default role
            },
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: "REGISTER_SUCCESS",
                details: "User registered successfully",
                ip
            }
        });

        return NextResponse.json(
            { success: true, message: "Registration successful" },
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
