"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { format, isAfter, subHours } from "date-fns";
import { generateICS } from "@/lib/calendar";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Appointment {
    id: string;
    dateTime: string;
    duration: number;
    status: string;
    notes?: string | null;
    user?: { name: string; email: string };
}

interface AppointmentsClientProps {
    session: {
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
        }
    } | null;
}

export default function AppointmentsClient({ session }: AppointmentsClientProps) {
    const { dict } = useLanguage();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (session) {
            fetchAppointments();
        } else {
            setLoading(false);
        }
    }, [session]);

    if (!session) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h1 style={{ color: "var(--primary-teal)", marginBottom: '2rem' }}>{dict.myAppointments.title}</h1>
                <p style={{ marginBottom: '2rem' }}>{dict.myAppointments.loginRequired || "Please log in to view your appointments."}</p>
                <button
                    onClick={() => signIn(undefined, { callbackUrl: "/my-appointments" })}
                    className="btn btn-primary"
                >
                    {dict.auth.login.btn || "Log In"}
                </button>
            </div>
        );
    }

    async function fetchAppointments() {
        try {
            const res = await fetch("/api/appointments");
            if (res.ok) {
                const data = await res.json();
                setAppointments(data.appointments);
            }
        } catch (err) {
            console.error("Error fetching appointments:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(id: string, dateTime: string) {
        const bookingDate = new Date(dateTime);
        const now = new Date();

        // Logic: 24h before cancellation
        if (!isAfter(bookingDate, subHours(now, -24))) {
            alert(dict.myAppointments.cancelRestriction);
            return;
        }

        if (!confirm(dict.myAppointments.cancelConfirm)) return;

        try {
            const res = await fetch(`/api/appointments?id=${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "CANCELLED" }),
            });

            if (res.ok) {
                setMessage(dict.myAppointments.cancelSuccess);
                fetchAppointments();
            } else {
                const data = await res.json();
                setMessage(data.error || dict.myAppointments.cancelError);
            }
        } catch {
            setMessage("Error occurred.");
        }
    }

    async function handleDownload(appt: Appointment) {
        const ics = generateICS({
            id: appt.id,
            dateTime: new Date(appt.dateTime),
            duration: appt.duration,
            summary: "Pediatric Appointment: Dr. Manolova",
            description: `Session: ${appt.notes || "Clinical Consultation"}`
        });

        const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'appointment.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const now = new Date();
    const upcoming = appointments.filter(a => isAfter(new Date(a.dateTime), now) && a.status !== 'CANCELLED');
    const past = appointments.filter(a => !isAfter(new Date(a.dateTime), now) || a.status === 'CANCELLED');

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 style={{ color: "var(--primary-teal)", textAlign: "center", marginBottom: '3rem' }}>{dict.myAppointments.title}</h1>

            {message && <div style={{ padding: '1rem', background: 'var(--bg-soft)', color: 'var(--primary-teal)', borderRadius: '4px', textAlign: 'center', marginBottom: '2rem', border: '1px solid var(--border)' }}>{message}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                <section>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-teal)', borderBottom: '2px solid var(--bg-soft)', paddingBottom: '0.5rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {dict.myAppointments.upcoming}
                    </h2>
                    <div style={{ background: 'var(--bg-white)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
                        {upcoming.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>{dict.myAppointments.empthy}</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {upcoming.map((appt) => (
                                    <div key={appt.id} className="table-responsive" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: '500px' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: 'var(--text-charcoal)' }}>{format(new Date(appt.dateTime), "PPPP")}</div>
                                                <div style={{ color: 'var(--text-muted)' }}>{format(new Date(appt.dateTime), "p")} - <span style={{ color: '#2e7d32', fontWeight: '700' }}>{dict.myAppointments.confirmed}</span></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleDownload(appt)}
                                                    style={{ background: 'var(--bg-header-alt)', color: 'var(--primary-teal)', border: '1px solid var(--primary-teal)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800' }}
                                                >
                                                    {dict.myAppointments.download}
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(appt.id, appt.dateTime)}
                                                    style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800' }}
                                                >
                                                    {dict.myAppointments.cancel}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', borderBottom: '2px solid var(--bg-soft)', paddingBottom: '0.5rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {dict.myAppointments.past}
                    </h2>
                    <div style={{ background: 'var(--bg-white)', padding: '1.5rem', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', opacity: 0.8, border: '1px solid var(--border)' }}>
                        {past.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>No history found.</p>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {past.map((appt) => (
                                    <div key={appt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>{format(new Date(appt.dateTime), "PPPP")}</div>
                                            <div style={{ color: 'var(--text-muted)', opacity: 0.8 }}>
                                                {format(new Date(appt.dateTime), "p")} -
                                                <span style={{ color: appt.status === 'CANCELLED' ? '#c53030' : '#4a5568', fontWeight: '700', marginLeft: '0.5rem' }}>
                                                    {appt.status === 'CANCELLED' ? dict.myAppointments.cancelled : "COMPLETED"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
