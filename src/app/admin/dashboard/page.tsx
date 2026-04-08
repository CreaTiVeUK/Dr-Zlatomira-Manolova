import { getSession } from "@/lib/auth";
import { getServerLanguage } from "@/lib/i18n/server";
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
import { bg, enUS } from "date-fns/locale";

export default async function AdminDashboard() {
    // Middleware guarantees an authenticated ADMIN session reaches this page
    const session = (await getSession())!;
    const language = await getServerLanguage();
    const dateLocale = language === "bg" ? bg : enUS;
    const copy = language === "bg"
        ? {
            unknownPatient: "Неизвестен пациент",
            scheduledAppointment: "Насрочен час",
            completedAppointment: "Приключен час",
            cancelledAppointment: "Отменен час",
            alerts: {
                todayTitle: (count: number) => `${count} часа са планирани за днес`,
                todayNext: (patient: string, time: string) => `Следващ пациент: ${patient} в ${time}`,
                todayEmpty: "Няма запазени часове за днес.",
                todayCta: "Отвори графика",
                unpaidTitle: (count: number) => `${count} запазени часа все още не са платени`,
                unpaidClear: "Всички запазени часове са финансово уредени",
                unpaidDesc: "Прегледайте предстоящите посещения, които още чакат плащане.",
                unpaidClearDesc: "Няма неплатени запазени посещения, които изискват действие.",
                reviewPayments: "Прегледай плащанията",
                viewAppointments: "Виж часовете",
                joinedTitle: (count: number) => `${count} пациенти са се регистрирали днес`,
                joinedDesc: (count: number) => `${count} пациентски профила са създадени през последните 30 дни.`,
                openPatients: "Отвори пациентите",
                weekTitle: (count: number) => `${count} посещения предстоят през следващите 7 дни`,
                weekDesc: "Използвайте графика, за да потвърдите седмицата и да отворите досиетата преди всяка консултация.",
                weekCta: "Планирай седмицата",
            },
            extended: "Удължен",
            doctor: "Лекар",
        }
        : {
            unknownPatient: "Unknown Patient",
            scheduledAppointment: "Scheduled appointment",
            completedAppointment: "Completed appointment",
            cancelledAppointment: "Cancelled appointment",
            alerts: {
                todayTitle: (count: number) => `${count} appointments scheduled today`,
                todayNext: (patient: string, time: string) => `Next patient: ${patient} at ${time}`,
                todayEmpty: "No appointments are booked for today.",
                todayCta: "Open schedule",
                unpaidTitle: (count: number) => `${count} booked appointments still unpaid`,
                unpaidClear: "All booked appointments are financially up to date",
                unpaidDesc: "Review upcoming visits that still need payment follow-up.",
                unpaidClearDesc: "No unpaid booked visits need action right now.",
                reviewPayments: "Review payments",
                viewAppointments: "View appointments",
                joinedTitle: (count: number) => `${count} patients joined today`,
                joinedDesc: (count: number) => `${count} patient accounts created in the last 30 days.`,
                openPatients: "Open patients",
                weekTitle: (count: number) => `${count} visits coming in the next 7 days`,
                weekDesc: "Use the schedule view to confirm the week and open patient files before each consultation.",
                weekCta: "Plan the week",
            },
            extended: "Extended",
            doctor: "Doctor",
        };

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
                createdAt: true,
                _count: {
                    select: {
                        children: true,
                        documents: true,
                    },
                },
            },
        }).catch(() =>
            // Graceful degradation if newer relations aren't migrated yet
            prisma.user.findMany({
                where: { role: "PATIENT" },
                select: { id: true, name: true, createdAt: true },
            }).then((rows) => rows.map((r) => ({ ...r, _count: { children: 0, documents: 0 } })))
        ),
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
            patient: appointment.user.name || copy.unknownPatient,
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
        patient: appointment.user.name || copy.unknownPatient,
        dateLabel: format(new Date(appointment.dateTime), "EEE, MMM d", { locale: dateLocale }),
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
            name: patient.name || copy.unknownPatient,
            joinedLabel: format(new Date(patient.createdAt), "MMM d, yyyy", { locale: dateLocale }),
            appointmentsCount: appointments.filter((appointment) => appointment.userId === patient.id).length,
            documentsCount: (patient as { _count?: { documents?: number } })._count?.documents ?? 0,
            childrenCount: (patient as { _count?: { children?: number } })._count?.children ?? 0,
        }));

    // Sort by when the appointment was created (booked), not when it's scheduled.
    // This ensures "Recent Activity" shows genuinely recent events.
    const recentActivity = [...appointments]
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
        .slice(0, 6)
        .map((appointment) => ({
            id: appointment.id,
            userId: appointment.userId,
            patient: appointment.user.name || copy.unknownPatient,
            eventLabel: appointment.status === "CANCELLED" ? copy.cancelledAppointment : appointment.status === "COMPLETED" ? copy.completedAppointment : copy.scheduledAppointment,
            timestampLabel: format(new Date(appointment.createdAt), "MMM d, yyyy • HH:mm", { locale: dateLocale }),
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
            title: copy.alerts.todayTitle(stats.todayAppointments),
            description: todaySchedule.length > 0
                ? copy.alerts.todayNext(todaySchedule[0].patient, todaySchedule[0].time)
                : copy.alerts.todayEmpty,
            href: "/admin/appointments?scope=TODAY",
            cta: copy.alerts.todayCta
        },
        {
            id: "unpaid",
            tone: unpaidAppointments.length > 0 ? "warning" : "success",
            title: unpaidAppointments.length > 0
                ? copy.alerts.unpaidTitle(unpaidAppointments.length)
                : copy.alerts.unpaidClear,
            description: unpaidAppointments.length > 0
                ? copy.alerts.unpaidDesc
                : copy.alerts.unpaidClearDesc,
            href: "/admin/appointments?scope=UPCOMING&payment=UNPAID",
            cta: unpaidAppointments.length > 0 ? copy.alerts.reviewPayments : copy.alerts.viewAppointments
        },
        {
            id: "new-patients",
            tone: "info",
            title: copy.alerts.joinedTitle(patients.filter((patient) => patient.createdAt >= todayStart).length),
            description: copy.alerts.joinedDesc(patients.filter((patient) => patient.createdAt >= subMonths(now, 1)).length),
            href: "/admin/users",
            cta: copy.alerts.openPatients
        },
        {
            id: "next-seven-days",
            tone: "success",
            title: copy.alerts.weekTitle(appointments.filter((appointment) => new Date(appointment.dateTime) >= now && new Date(appointment.dateTime) <= inSevenDays && appointment.status === "BOOKED").length),
            description: copy.alerts.weekDesc,
            href: "/admin/appointments?scope=UPCOMING&status=BOOKED",
            cta: copy.alerts.weekCta
        }
    ];

    const monthlyVisits = [];
    for (let index = 5; index >= 0; index -= 1) {
        const date = subMonths(now, index);
        const monthName = format(date, "MMM", { locale: dateLocale });
        const count = appointments.filter((appointment) => isSameMonth(new Date(appointment.dateTime), date) && isSameYear(new Date(appointment.dateTime), date)).length;
        monthlyVisits.push({ name: monthName, visits: count });
    }

    const appointmentTypes = [
        { name: "30 min", value: appointments.filter((appointment) => appointment.duration <= 30).length },
        { name: "60 min", value: appointments.filter((appointment) => appointment.duration > 30 && appointment.duration <= 60).length },
        { name: copy.extended, value: appointments.filter((appointment) => appointment.duration > 60).length }
    ].filter((entry) => entry.value > 0);

    return (
        <AdminDashboardClient
            adminName={session.user.name || copy.doctor}
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
