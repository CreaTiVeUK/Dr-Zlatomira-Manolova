import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    try {
        const appointments = await prisma.appointment.findMany({
            where: { status: "BOOKED" },
            select: {
                dateTime: true,
                duration: true,
            },
        });

        // Extracting booked slots with their durations
        const takenSlots = appointments.map((a: { dateTime: Date; duration: number }) => ({
            dateTime: a.dateTime.toISOString(),
            duration: a.duration,
        }));

        return NextResponse.json({ takenSlots });
    } catch (error) {
        console.error("Availability API Error:", error);
        return NextResponse.json({ error: "Could not fetch availability" }, { status: 500 });
    }
}
