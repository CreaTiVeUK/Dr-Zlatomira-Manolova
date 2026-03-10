import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";
import AdminDashboardClient from "./AdminDashboardClient";
import {
    addDays,
    format,
    isSameDay,
    isSameMonth,
    isSameYear,
    startOfDay,
    subMonths
} from "date-fns";

export default async function AdminDashboard() {
    const session = await getSession();

    if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const [appointments, patients, documentsCount] = await Promise.all([
        prisma.appointment.findMany({
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
        }),
        prisma.user.findMany({
            where: { role: "PATIENT" },
            select: {
                id: true,
                name: true,
                createdAt: true
            }
        }),
        prisma.patientDocument.count().catch((error) => {
            if (isMissingTableError(error)) {
                return 0;
            }

            throw error;
        })
    ]);

    const now = new Date();
    const todayStart = startOfDay(now);
    const inSevenDays = addDays(now, 7);

    const todayAppointments = appointments.filter((appointment) => isSameDay(new Date(appointment.dateTime), now));
    const upcomingAppointments = appointments.filter((appointment) => new Date(appointment.dateTime) >= now && appointment.status === "BOOKED");
    const unpaidAppointments = appointments.filter((appointment) => appointment.status === "BOOKED" && appointment.paymentStatus !== "PAID");
    const monthRevenue = appointments
        .filter((appointment) => appointment.paymentStatus === "PAID" && isSameMonth(new Date(appointment.dateTime), now) && isSameYear(new Date(appointment.dateTime), now))
        .reduce((sum, appointment) => sum + appointment.price, 0);

    const stats = {
        todayAppointments: todayAppointments.filter((appointment) => appointment.status !== "CANCELLED").length,
        upcomingAppointments: upcomingAppointments.length,
        patients: patients.length,
        unpaidAppointments: unpaidAppointments.length,
        monthRevenue,
        documents: documentsCount
    };

    const todaySchedule = todayAppointments
        .sort((left, right) => new Date(left.dateTime).getTime() - new Date(right.dateTime).getTime())
        .map((appointment) => ({
            id: appointment.id,
            userId: appointment.userId,
            patient: appointment.user.name || "Unknown Patient",
            email: appointment.user.email || "",
            time: format(new Date(appointment.dateTime), "HH:mm"),
            status: appointment.status,
            paymentStatus: appointment.paymentStatus,
            duration: appointment.duration,
            notes: appointment.notes || ""
        }));

    const upcomingQueue = upcomingAppointments.slice(0, 6).map((appointment) => ({
        id: appointment.id,
        userId: appointment.userId,
        patient: appointment.user.name || "Unknown Patient",
        dateLabel: format(new Date(appointment.dateTime), "EEE, MMM d"),
        timeLabel: format(new Date(appointment.dateTime), "HH:mm"),
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        notes: appointment.notes || "",
        duration: appointment.duration
    }));

    const recentPatients = patients
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
        .slice(0, 6)
        .map((patient) => ({
            id: patient.id,
            name: patient.name || "Unknown Patient",
            joinedLabel: format(new Date(patient.createdAt), "MMM d, yyyy"),
            appointmentsCount: appointments.filter((appointment) => appointment.userId === patient.id).length,
            documentsCount: 0,
            childrenCount: 0
        }));

    const recentActivity = [...appointments]
        .sort((left, right) => new Date(right.dateTime).getTime() - new Date(left.dateTime).getTime())
        .slice(0, 6)
        .map((appointment) => ({
            id: appointment.id,
            userId: appointment.userId,
            patient: appointment.user.name || "Unknown Patient",
            eventLabel: `${appointment.status === "CANCELLED" ? "Cancelled" : "Scheduled"} appointment`,
            timestampLabel: format(new Date(appointment.dateTime), "MMM d, yyyy • HH:mm"),
            status: appointment.status
        }));

    const alerts: {
        id: string;
        tone: "info" | "warning" | "success";
        title: string;
        description: string;
        href: string;
        cta: string;
    }[] = [
        {
            id: "today",
            tone: "info",
            title: `${stats.todayAppointments} appointments scheduled today`,
            description: todaySchedule.length > 0
                ? `Next patient: ${todaySchedule[0].patient} at ${todaySchedule[0].time}`
                : "No appointments are booked for today.",
            href: "/admin/appointments",
            cta: "Open schedule"
        },
        {
            id: "unpaid",
            tone: unpaidAppointments.length > 0 ? "warning" : "success",
            title: unpaidAppointments.length > 0
                ? `${unpaidAppointments.length} booked appointments still unpaid`
                : "All booked appointments are financially up to date",
            description: unpaidAppointments.length > 0
                ? "Review upcoming visits that still need payment follow-up."
                : "No unpaid booked visits need action right now.",
            href: "/admin/appointments",
            cta: unpaidAppointments.length > 0 ? "Review payments" : "View appointments"
        },
        {
            id: "new-patients",
            tone: "info",
            title: `${patients.filter((patient) => patient.createdAt >= todayStart).length} patients joined today`,
            description: `${patients.filter((patient) => patient.createdAt >= subMonths(now, 1)).length} patient accounts created in the last 30 days.`,
            href: "/admin/users",
            cta: "Open patients"
        },
        {
            id: "next-seven-days",
            tone: "success",
            title: `${appointments.filter((appointment) => new Date(appointment.dateTime) >= now && new Date(appointment.dateTime) <= inSevenDays && appointment.status === "BOOKED").length} visits coming in the next 7 days`,
            description: "Use the schedule view to confirm the week and open patient files before each consultation.",
            href: "/admin/appointments",
            cta: "Plan the week"
        }
    ];

    const monthlyVisits = [];
    for (let index = 5; index >= 0; index -= 1) {
        const date = subMonths(now, index);
        const monthName = format(date, "MMM");
        const count = appointments.filter((appointment) => isSameMonth(new Date(appointment.dateTime), date) && isSameYear(new Date(appointment.dateTime), date)).length;
        monthlyVisits.push({ name: monthName, visits: count });
    }

    const appointmentTypes = [
        { name: "30 min", value: appointments.filter((appointment) => appointment.duration <= 30).length },
        { name: "60 min", value: appointments.filter((appointment) => appointment.duration > 30 && appointment.duration <= 60).length },
        { name: "Extended", value: appointments.filter((appointment) => appointment.duration > 60).length }
    ].filter((entry) => entry.value > 0);

    return (
        <AdminDashboardClient
            adminName={session.user.name || "Doctor"}
            stats={stats}
            alerts={alerts}
            todaySchedule={todaySchedule}
            upcomingQueue={upcomingQueue}
            recentPatients={recentPatients}
            recentActivity={recentActivity}
            monthlyVisits={monthlyVisits}
            appointmentTypes={appointmentTypes}
        />
    );
}
