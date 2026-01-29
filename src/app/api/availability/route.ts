import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { startOfDay, endOfDay, addDays } from "date-fns";

const querySchema = z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
    // 1. Security: Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limiter = rateLimit(ip, 20, 60000); // 20 requests per minute

    if (!limiter.success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // 2. Optimization: Date Filtering
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    const validation = querySchema.safeParse({
        start: startParam ?? undefined,
        end: endParam ?? undefined
    });

    if (!validation.success) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    let startDate: Date;
    let endDate: Date;

    if (validation.data.start && validation.data.end) {
        startDate = new Date(validation.data.start);
        endDate = new Date(validation.data.end);
    } else {
        // Default: Next 7 days + buffer if not specified
        startDate = startOfDay(new Date());
        endDate = endOfDay(addDays(new Date(), 30));
    }

    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                status: "BOOKED",
                dateTime: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                dateTime: true,
                duration: true,
            },
        });

        // Extracting booked slots with their durations
        const takenSlots = appointments.map((a) => ({
            dateTime: a.dateTime.toISOString(),
            duration: a.duration,
        }));

        return NextResponse.json({ takenSlots });
    } catch (error: unknown) {
        console.error("Availability API Error:", error);
        return NextResponse.json({ error: "Could not fetch availability" }, { status: 500 });
    }
}
