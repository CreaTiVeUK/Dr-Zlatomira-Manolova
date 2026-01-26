import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { login } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";


// Removed new PrismaClient instantiation

const loginSchema = z.object({
    email: z.string().email().transform(v => sanitizeString(v)),
    password: z.string().min(8),
});

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limiter = rateLimit(ip, 50, 60000);

    if (!limiter.success) {
        return NextResponse.json(
            { error: "Security Alert: Too many login attempts. Please wait." },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const result = loginSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid login format" }, { status: 400 });
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Lockout Check
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            return NextResponse.json({ error: "Account locked due to multiple failures. Try again later." }, { status: 403 });
        }

        if (!user.password) {
            return NextResponse.json({ error: "Please login with your social account" }, { status: 401 });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            const attempts = user.failedAttempts + 1;
            const lockoutTime = attempts >= 5 ? new Date(Date.now() + 15 * 60000) : null;

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedAttempts: attempts,
                    lockedUntil: lockoutTime
                }
            });

            // Audit Failed Login
            await prisma.auditLog.create({
                data: {
                    userId: user.id,
                    action: "LOGIN_FAILED",
                    details: `Failed attempt ${attempts}`,
                    ip
                }
            });

            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Success - Reset counters
        await prisma.user.update({
            where: { id: user.id },
            data: {
                failedAttempts: 0,
                lockedUntil: null,
                lastActivity: new Date()
            }
        });

        const sessionData = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name || user.email
        };

        await login(sessionData);

        // Audit Success Login
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: "LOGIN_SUCCESS",
                details: "User logged in successfully",
                ip
            }
        });

        return NextResponse.json({ success: true, role: user.role });
    } catch (error: unknown) {
        console.error("Login Security Filter Error:", error);
        return NextResponse.json({ error: "Security verification failed" }, { status: 500 });
    }
}
