/**
 * POST /api/auth/lockout-status
 *
 * Returns the number of milliseconds remaining on a lockout for a given email,
 * or { locked: false } if the email isn't locked (including if it doesn't
 * exist). This endpoint is ONLY useful to someone who already got an
 * account_locked signin error — it does not materially leak information
 * beyond what the signin attempt already revealed.
 *
 * Heavily rate-limited to prevent abuse.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";

const schema = z.object({
    email: z.string().email().transform((v) => sanitizeString(v).toLowerCase()),
});

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = await rateLimit(`lockout:${ip}`, 10, 60_000);
    if (!limiter.success) {
        return NextResponse.json({ locked: false }, { status: 429 });
    }

    try {
        const body = await request.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) return NextResponse.json({ locked: false });

        const user = await prisma.user.findUnique({
            where: { email: parsed.data.email },
            select: { lockedUntil: true },
        });

        if (!user?.lockedUntil) return NextResponse.json({ locked: false });

        const remainingMs = user.lockedUntil.getTime() - Date.now();
        if (remainingMs <= 0) return NextResponse.json({ locked: false });

        return NextResponse.json({ locked: true, remainingMs });
    } catch {
        return NextResponse.json({ locked: false });
    }
}
