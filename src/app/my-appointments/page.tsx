"use client";

import { useState, useEffect } from "react";
import { format, isAfter, subHours } from "date-fns";
import { generateICS } from "@/lib/calendar";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function MyAppointments() {
    const { dict } = useLanguage();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchAppointments();
    }, []);

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
        } catch (err) {
            setMessage("Error occurred.");
        }
    }

    async function handleDownload(appt: any) {
        const ics = generateICS({
            id: appt.id,
            dateTime: new Date(appt.dateTime),
            duration: appt.duration,
            summary: "Pediatric Appointment: Dr. Manolova", // Keep semi-english/universal or use dict if strictly needed. Leaving generic.
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

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <h1 style={{ color: "var(--primary-teal)", textAlign: "center", marginBottom: '2rem' }}>{dict.myAppointments.title}</h1>

            {message && <div style={{ padding: '1rem', background: '#e0f7fa', color: '#006064', borderRadius: '4px', textAlign: 'center', marginBottom: '2rem' }}>{message}</div>}

            <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {appointments.length === 0 ? (
                    <p style={{ textAlign: 'center' }}>{dict.myAppointments.empthy}</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {appointments.map((appt) => (
                            <div key={appt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{format(new Date(appt.dateTime), "PPPP")}</div>
                                    <div style={{ color: '#666' }}>{format(new Date(appt.dateTime), "p")} - {appt.status === 'CANCELLED' ? dict.myAppointments.cancelled : dict.myAppointments.confirmed}</div>
                                </div>
                                {appt.status !== 'CANCELLED' && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleDownload(appt)}
                                            style={{ background: '#f4f9fa', color: 'var(--primary-teal)', border: '1px solid var(--primary-teal)', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800' }}
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
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
