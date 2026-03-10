import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, isSameDay, startOfDay } from "date-fns";
import AdminAppointmentsClient from "./AdminAppointmentsClient";

export default async function AdminAppointmentsPage() {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const appointments = await prisma.appointment.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { dateTime: "asc" }
    });

    const now = new Date();
    const todayStart = startOfDay(now);

    const summary = {
        today: appointments.filter((appointment) => isSameDay(new Date(appointment.dateTime), now) && appointment.status !== "CANCELLED").length,
        upcoming: appointments.filter((appointment) => new Date(appointment.dateTime) >= now && appointment.status === "BOOKED").length,
        unpaid: appointments.filter((appointment) => appointment.status === "BOOKED" && appointment.paymentStatus !== "PAID").length,
        cancelledToday: appointments.filter((appointment) => isSameDay(new Date(appointment.dateTime), now) && appointment.status === "CANCELLED").length
    };

    const serializedAppointments = appointments.map((appointment) => ({
        id: appointment.id,
        userId: appointment.userId,
        patient: appointment.user.name || "Unknown Patient",
        email: appointment.user.email || "",
        dateLabel: format(new Date(appointment.dateTime), "EEE, MMM d, yyyy"),
        timeLabel: format(new Date(appointment.dateTime), "HH:mm"),
        isoDate: new Date(appointment.dateTime).toISOString(),
        duration: appointment.duration,
        price: appointment.price,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        notes: appointment.notes || "",
        isToday: isSameDay(new Date(appointment.dateTime), now),
        isPast: new Date(appointment.dateTime) < todayStart
    }));

    return <AdminAppointmentsClient appointments={serializedAppointments} summary={summary} />;
}
