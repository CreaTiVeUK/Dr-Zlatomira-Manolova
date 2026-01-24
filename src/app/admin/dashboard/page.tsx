import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export default async function AdminDashboard() {
    const session = await getSession();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    const appointments = await prisma.appointment.findMany({
        orderBy: { dateTime: "asc" },
        include: {
            user: { select: { name: true, email: true } },
        },
    });

    const auditLogs = await (prisma as any).auditLog.findMany({
        take: 20,
        orderBy: { timestamp: "desc" },
        include: { user: { select: { name: true } } }
    });

    return (
        <div className="section-padding bg-soft" style={{ minHeight: '100vh' }}>
            <div className="container">
                <div style={{ marginBottom: '3rem' }}>
                    <h1 className="section-title">Practice Control Center</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Managed clinical operations and security audits.</p>
                </div>

                {/* DASHBOARD GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    <div className="premium-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-teal)' }}>{appointments.length}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700' }}>TOTAL BOOKINGS</div>
                    </div>
                    <div className="premium-card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary-teal)' }}>{auditLogs.length}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '700' }}>SECURITY EVENTS</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

                    {/* APPOINTMENTS TABLE */}
                    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                        <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--primary-teal)' }}>UPCOMING APPOINTMENTS</h2>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid var(--bg-soft)", textAlign: "left", fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: "1rem" }}>PATIENT</th>
                                    <th style={{ padding: "1rem" }}>DATE & TIME</th>
                                    <th style={{ padding: "1rem" }}>STATUS</th>
                                    <th style={{ padding: "1rem" }}>FEE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((appt) => (
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

                    {/* LIVE AUDIT LOG */}
                    <div style={{ background: '#1a1a1a', padding: '2.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)', color: '#eee' }}>
                        <h2 style={{ marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--accent-bluish)' }}>SYSTEM AUDIT TRAIL</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {auditLogs.map((log: any) => (
                                <div key={log.id} style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <div>
                                        <span style={{ color: 'var(--accent-bluish)', fontWeight: '700', marginRight: '1rem' }}>[{log.action}]</span>
                                        <span style={{ color: '#aaa' }}>{log.details}</span>
                                    </div>
                                    <div style={{ color: '#666' }}>{format(new Date(log.timestamp), "HH:mm:ss")}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

