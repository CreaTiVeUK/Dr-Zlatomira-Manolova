
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";
import { isSameMonth, subMonths, isSameYear, format } from "date-fns";

export default async function AdminDashboard() {
    const session = await getSession();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    // --- DATA FETCHING ---
    const [appointments, users] = await Promise.all([
        prisma.appointment.findMany({ include: { user: true }, orderBy: { dateTime: 'desc' } }),
        prisma.user.findMany({ where: { role: 'PATIENT' } }),
    ]);

    const now = new Date();

    // 1. STATS
    const totalRevenue = appointments
        .filter(a => a.paymentStatus === 'PAID')
        .reduce((sum, a) => sum + a.price, 0);

    const admittedPatients = users.length; // Simply total patients for now since we don't have "Admission" status

    const stats = {
        appointments: appointments.length,
        patients: users.length,
        admitted: admittedPatients,
        revenue: totalRevenue
    };

    // 2. UPCOMING QUEUE
    const upcoming = appointments
        .filter(a => new Date(a.dateTime) > now && a.status !== 'CANCELLED')
        .slice(0, 5) // Top 5
        .map(a => ({
            time: format(new Date(a.dateTime), "hh:mm a"),
            patient: a.user.name || "Unknown",
            reason: a.notes,
            type: "Follow up" // Placeholder logic
        }));

    // 3. RECENT PATIENTS LIST
    const recentPatients = appointments.slice(0, 5).map(a => ({
        name: a.user.name || "Unknown",
        date: format(new Date(a.dateTime), "MMM d, yyyy"),
        type: a.status === 'BOOKED' ? 'Upcoming' : 'Past',
        status: a.status
    }));

    // 4. CHART: MONTHLY VISITS
    // Generate last 6 months buckets
    const monthlyVisits = [];
    for (let i = 5; i >= 0; i--) {
        const date = subMonths(now, i);
        const monthName = format(date, "MMM");
        const count = appointments.filter(a => isSameMonth(new Date(a.dateTime), date) && isSameYear(new Date(a.dateTime), date)).length;
        monthlyVisits.push({ name: monthName, patients: count });
    }

    // 5. CHART: APPOINTMENT TYPES
    const typeFollowUp = appointments.filter(a => a.duration === 30).length;
    const typeFirstVisit = appointments.filter(a => a.duration === 60).length;
    const typeEmergency = appointments.filter(a => a.notes?.toLowerCase().includes('emergency')).length;

    const appointmentTypes = [
        { name: 'Follow up', value: typeFollowUp },
        { name: 'First visit', value: typeFirstVisit },
        { name: 'Emergency', value: typeEmergency }
    ];

    return (
        <AdminDashboardClient
            stats={stats}
            upcoming={upcoming}
            recentPatients={recentPatients}
            monthlyVisits={monthlyVisits}
            appointmentTypes={appointmentTypes}
        />
    );
}
