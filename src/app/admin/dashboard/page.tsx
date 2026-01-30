import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format, isAfter } from "date-fns";
import { en, bg } from "@/lib/i18n/dictionaries";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function AdminDashboard() {
    const session = await getSession();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const cookieStore = await cookies();
    const lang = cookieStore.get("language")?.value || "en";
    const d = lang === "bg" ? bg.admin : en.admin;

    const appointments = await prisma.appointment.findMany({
        orderBy: { dateTime: "asc" },
        include: {
            user: { select: { name: true, email: true } },
        },
    });

    interface AuditLogWithUser {
        id: string;
        action: string;
        details: string | null;
        timestamp: Date;
        user: { name: string | null };
    }

    const auditLogs = (await prisma.auditLog.findMany({
        take: 20,
        orderBy: { timestamp: "desc" },
        include: { user: { select: { name: true } } }
    })) as AuditLogWithUser[];

    const now = new Date();
    const upcoming = appointments.filter(a => isAfter(new Date(a.dateTime), now) && a.status !== 'CANCELLED');
    const historical = appointments.filter(a => !isAfter(new Date(a.dateTime), now) || a.status === 'CANCELLED');

    return (
        <div className="section-padding bg-soft" style={{ minHeight: '100vh' }}>
            <div className="container">
                <div style={{ marginBottom: '3rem' }}>
                    <h1 className="section-title">{d.practiceControl}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{d.clinicalOps}</p>
                </div>

                {/* DASHBOARD GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    <div className="premium-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-teal)' }}>{upcoming.length}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>{d.upcoming}</div>
                    </div>
                    <div className="premium-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#666' }}>{historical.length}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>{d.historical}</div>
                    </div>
                    <div className="premium-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-teal)' }}>{auditLogs.length}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700' }}>{d.securityEvents}</div>
                    </div>
                    <Link href="/admin/users" className="premium-card" style={{ textAlign: 'center', textDecoration: 'none', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#0284c7' }}>👥</div>
                        <div style={{ color: '#0369a1', fontSize: '0.8rem', fontWeight: '700', marginTop: '0.5rem' }}>MANAGE PATIENTS</div>
                    </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

                    {/* UPCOMING APPOINTMENTS */}
                    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                        <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--primary-teal)', borderBottom: '2px solid var(--bg-soft)', paddingBottom: '1rem' }}>
                            {d.upcoming}
                        </h2>
                        {upcoming.length === 0 ? <p style={{ color: '#999' }}>No upcoming sessions.</p> : (
                            <div className="table-responsive">
                                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: '600px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: "2px solid var(--bg-soft)", textAlign: "left", fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            <th style={{ padding: "1rem" }}>{d.patient}</th>
                                            <th style={{ padding: "1rem" }}>{d.dateTime}</th>
                                            <th style={{ padding: "1rem" }}>{d.status}</th>
                                            <th style={{ padding: "1rem" }}>{d.fee}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {upcoming.map((appt) => (
                                            <tr key={appt.id} style={{ borderBottom: "1px solid var(--bg-soft)" }}>
                                                <td style={{ padding: "1.2rem 1rem" }}>
                                                    <div style={{ fontWeight: "700" }}>{appt.user.name}</div>
                                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{appt.user.email}</div>
                                                </td>
                                                <td style={{ padding: "1rem" }}>
                                                    <div style={{ fontWeight: '600' }}>{format(new Date(appt.dateTime), "MMM d, yyyy")}</div>
                                                    <div style={{ fontSize: '0.8rem' }}>{format(new Date(appt.dateTime), "HH:mm")}</div>
                                                </td>
                                                <td style={{ padding: "1rem" }}>
                                                    <span style={{
                                                        background: appt.paymentStatus === "PAID" ? '#e8f5e9' : '#fff3e0',
                                                        color: appt.paymentStatus === "PAID" ? '#2e7d32' : '#e65100',
                                                        padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700'
                                                    }}>
                                                        {appt.paymentStatus}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "1rem", fontWeight: '700' }}>£{appt.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* AUDIT & HISTORY GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 400px)', gap: '2rem' }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>{d.historical}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {historical.slice(0, 10).map((appt) => (
                                    <div key={appt.id} style={{ borderBottom: '1px solid var(--bg-soft)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span>{appt.user.name}</span>
                                        <span style={{ color: appt.status === 'CANCELLED' ? '#c53030' : '#4a5568' }}>
                                            {format(new Date(appt.dateTime), "MMM d")} - {appt.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)', color: '#eee' }}>
                            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--accent-bluish)' }}>{d.auditTrail}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {auditLogs.map((log) => (
                                    <div key={log.id} style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <div>
                                            <span style={{ color: 'var(--accent-bluish)', fontWeight: '700', marginRight: '0.5rem' }}>[{log.action}]</span>
                                            <span style={{ color: '#aaa' }}>{log.details?.substring(0, 30)}...</span>
                                        </div>
                                        <div style={{ color: '#666' }}>{format(new Date(log.timestamp), "HH:mm")}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
