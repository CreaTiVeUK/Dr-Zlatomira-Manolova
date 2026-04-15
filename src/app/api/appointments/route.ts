import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { format } from "date-fns";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { sendEmail, EMAIL_TEMPLATES } from "@/lib/email";
import { logger } from "@/lib/logger";
import { createAuditLog, AuditAction } from "@/lib/audit";


// Removed singleton instance

const bookingSchema = z.object({
    dateTime: z.string().datetime().refine(val => new Date(val) > new Date(), {
        message: "Booking must be in the future"
    }),
    duration: z.number().int().min(15, "Duration must be at least 15m").max(120),
    price: z.number().positive("Price must be greater than zero").max(500, "Price exceeds allowed maximum"),
    notes: z.string().max(500).transform(v => sanitizeString(v)).optional(),
    userId: z.string().uuid().optional(),
});

const patchSchema = z.union([
    z.object({ status: z.enum(["BOOKED", "CANCELLED", "COMPLETED"]) }),
    z.object({
        dateTime: z.string().datetime().refine(val => new Date(val) > new Date(), {
            message: "New time must be in the future"
        }),
    }),
]);

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    try {
        const { user } = session;
        let appointments;

        if (user.role === "ADMIN") {
            appointments = await prisma.appointment.findMany({
                orderBy: { dateTime: 'asc' },
                include: { user: { select: { name: true, email: true } } }
            });
        } else {
            appointments = await prisma.appointment.findMany({
                where: { userId: user.id },
                orderBy: { dateTime: 'asc' }
            });
        }

        return NextResponse.json({ appointments });
    } catch {
        return NextResponse.json({ error: "Action blocked by security policy" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limiter = await rateLimit(ip, 10, 60000);

    if (!limiter.success) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Access denied" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validation = bookingSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0].message || "Invalid data format" }, { status: 400 });
        }

        const { dateTime, duration, price, notes, userId } = validation.data;
        const bookingDate = new Date(dateTime);

        // Security: Admins can book for themselves OR others
        const targetUserId = session.user.role === 'ADMIN' && userId ? userId : session.user.id;

        // If it's not admin and they try to book for someone else (prevented by schema default userId check, but explicit here)
        if (session.user.role !== 'ADMIN' && userId && userId !== session.user.id) {
            return NextResponse.json({ error: "Booking for others is restricted" }, { status: 403 });
        }

        const bookingEnd = new Date(bookingDate.getTime() + duration * 60000);


        // ATOMIC TRANSACTION: Check then Create
        return await prisma.$transaction(async (tx) => {
            const dayStart = new Date(bookingDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(bookingDate);
            dayEnd.setHours(23, 59, 59, 999);

            const dayAppointments = await tx.appointment.findMany({
                where: {
                    status: "BOOKED",
                    dateTime: { gte: dayStart, lte: dayEnd }
                }
            });

            const hasConflict = dayAppointments.some((appt) => {
                const start = appt.dateTime.getTime();
                const end = start + appt.duration * 60000;
                return (bookingDate.getTime() < end && bookingEnd.getTime() > start);
            });

            if (hasConflict) {
                return NextResponse.json({ error: "Slot unavailable" }, { status: 409 });
            }

            const newAppointment = await tx.appointment.create({
                data: {
                    dateTime: bookingDate,
                    duration,
                    price,
                    notes,
                    userId: targetUserId,
                    status: 'BOOKED'
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });

            await createAuditLog(session.user.id, AuditAction.APPOINTMENT_CREATE, `Appointment created for User ${targetUserId} on ${dateTime}`, ip);

            // Trigger Confirmation Email (Non-blocking)
            if (newAppointment.user?.email) {
                // We fire and forget, or handle error gracefully to not revert transaction
                sendEmail(
                    newAppointment.user.email,
                    EMAIL_TEMPLATES.CONFIRMATION(
                        newAppointment.user.name || "Patient",
                        format(bookingDate, "PPP"),
                        format(bookingDate, "p")
                    )
                ).catch((err: unknown) => {
                    logger.error("Failed to send confirmation email", err, { appointmentId: newAppointment.id });
                });
            }

            return NextResponse.json({ success: true, appointment: newAppointment });
        });

    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return NextResponse.json({ error: "That slot was just booked. Please choose another time." }, { status: 409 });
        }
        logger.error("Booking Transaction Error:", error);
        return NextResponse.json({ error: "Database operation failed" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!session || !id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validation = patchSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: id as string },
            include: { user: { select: { name: true, email: true } } }
        });

        if (!appointment) {
            return NextResponse.json({ error: "Resource not found" }, { status: 404 });
        }

        if (session.user.role !== 'ADMIN' && appointment.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
        }

        // Reschedule branch: move an existing booking to a new slot (atomic conflict check).
        if ("dateTime" in validation.data) {
            if (appointment.status !== "BOOKED") {
                return NextResponse.json({ error: "Only active bookings can be rescheduled" }, { status: 409 });
            }

            const newDate = new Date(validation.data.dateTime);
            const newEnd = new Date(newDate.getTime() + appointment.duration * 60000);

            const updated = await prisma.$transaction(async (tx) => {
                const dayStart = new Date(newDate); dayStart.setHours(0, 0, 0, 0);
                const dayEnd = new Date(newDate); dayEnd.setHours(23, 59, 59, 999);

                const dayAppointments = await tx.appointment.findMany({
                    where: {
                        status: "BOOKED",
                        dateTime: { gte: dayStart, lte: dayEnd },
                        id: { not: appointment.id },
                    }
                });

                const hasConflict = dayAppointments.some((appt) => {
                    const start = appt.dateTime.getTime();
                    const end = start + appt.duration * 60000;
                    return (newDate.getTime() < end && newEnd.getTime() > start);
                });

                if (hasConflict) {
                    return { conflict: true as const };
                }

                const next = await tx.appointment.update({
                    where: { id: appointment.id },
                    data: { dateTime: newDate, reminderSentAt: null },
                });
                return { conflict: false as const, next };
            });

            if (updated.conflict) {
                return NextResponse.json({ error: "Slot unavailable" }, { status: 409 });
            }

            const oldDate = appointment.dateTime;
            await createAuditLog(
                session.user.id,
                AuditAction.APPOINTMENT_RESCHEDULED,
                `Appointment ${appointment.id} rescheduled from ${oldDate.toISOString()} to ${newDate.toISOString()}`,
                ip,
            );

            if (appointment.user?.email) {
                sendEmail(
                    appointment.user.email,
                    EMAIL_TEMPLATES.RESCHEDULE(
                        appointment.user.name || "Patient",
                        format(oldDate, "PPP"),
                        format(newDate, "PPP"),
                        format(newDate, "p"),
                    ),
                ).catch((err: unknown) => logger.error("Failed to send reschedule email", err, { appointmentId: appointment.id }));
            }

            return NextResponse.json({ success: true, appointment: updated.next });
        }

        // Status change branch
        const { status } = validation.data;
        const updated = await prisma.appointment.update({
            where: { id: id as string },
            data: { status }
        });

        const auditAction = status === "CANCELLED" ? AuditAction.APPOINTMENT_CANCELLED
            : status === "COMPLETED" ? AuditAction.APPOINTMENT_COMPLETED
            : AuditAction.APPOINTMENT_CREATE;
        await createAuditLog(session.user.id, auditAction, `Appointment ${id} status updated to ${status}`, ip);

        if (status === 'CANCELLED') {
            await sendEmail(appointment.user?.email || "", EMAIL_TEMPLATES.CANCELLATION(appointment.user?.name || "Patient", format(new Date(appointment.dateTime), "PPP")));
        }

        return NextResponse.json({ success: true, appointment: updated });
    } catch (error) {
        logger.error("Appointment PATCH error:", error);
        return NextResponse.json({ error: "Modification blocked" }, { status: 500 });
    }
}
