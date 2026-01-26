import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const appointments = await prisma.appointment.findMany({
            where: { status: "BOOKED" },
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
