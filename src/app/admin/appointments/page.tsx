import { getServerLanguage } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { isSameDay, startOfDay } from "date-fns";
import { bg, enUS } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { CLINIC_TIMEZONE, inClinicTz } from "@/lib/clinic-hours";
import AdminAppointmentsClient from "./AdminAppointmentsClient";

export default async function AdminAppointmentsPage({
    searchParams
}: {
    searchParams: Promise<{
        scope?: string;
        status?: string;
        payment?: string;
        query?: string;
    }>;
}) {
    const language = await getServerLanguage();
    const dateLocale = language === "bg" ? bg : enUS;
    const unknownPatient = language === "bg" ? "Неизвестен пациент" : "Unknown Patient";

    const initialFilters = await searchParams;

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
    const nowInClinicTz = inClinicTz(now);
    const todayStart = startOfDay(nowInClinicTz);

    const summary = {
        today: appointments.filter((appointment) => isSameDay(inClinicTz(new Date(appointment.dateTime)), nowInClinicTz) && appointment.status !== "CANCELLED").length,
        upcoming: appointments.filter((appointment) => new Date(appointment.dateTime) >= now && appointment.status === "BOOKED").length,
        unpaid: appointments.filter((appointment) => appointment.status === "BOOKED" && appointment.paymentStatus !== "PAID").length,
        cancelledToday: appointments.filter((appointment) => isSameDay(inClinicTz(new Date(appointment.dateTime)), nowInClinicTz) && appointment.status === "CANCELLED").length
    };

    const serializedAppointments = appointments.map((appointment) => ({
        id: appointment.id,
        userId: appointment.userId,
        patient: appointment.user.name || unknownPatient,
        email: appointment.user.email || "",
        dateLabel: formatInTimeZone(new Date(appointment.dateTime), CLINIC_TIMEZONE, "EEE, MMM d, yyyy", { locale: dateLocale }),
        timeLabel: formatInTimeZone(new Date(appointment.dateTime), CLINIC_TIMEZONE, "HH:mm"),
        isoDate: new Date(appointment.dateTime).toISOString(),
        duration: appointment.duration,
        price: appointment.price,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        notes: appointment.notes || "",
        isToday: isSameDay(inClinicTz(new Date(appointment.dateTime)), nowInClinicTz),
        isPast: inClinicTz(new Date(appointment.dateTime)) < todayStart
    }));

    return <AdminAppointmentsClient appointments={serializedAppointments} summary={summary} initialFilters={initialFilters} />;
}
