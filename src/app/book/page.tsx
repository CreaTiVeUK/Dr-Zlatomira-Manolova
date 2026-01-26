"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { format, addDays, startOfDay } from "date-fns";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function BookPage() {
    const { dict } = useLanguage();
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        console.log(`[AUTH_DEBUG] BookPage: Session status=${status}, user=${session?.user?.email || 'none'}`);
    }, [session, status]);

    const SERVICES = [
        { name: dict.booking.services.standard, duration: 30, price: 25 },
        { name: dict.booking.services.specialized, duration: 60, price: 50 },
    ];

    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
    const [selectedService, setSelectedService] = useState(SERVICES[0]);
    const [slots, setSlots] = useState<Date[]>([]);
    const [bookedSlots, setBookedSlots] = useState<{ dateTime: string; duration: number }[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [tempSelectedSlot, setTempSelectedSlot] = useState<Date | null>(null);

    useEffect(() => {
        // Removed automatic redirect to prevent loops
    }, [status]);

    if (status === "loading") {
        return <div className="section-padding text-center"><div className="container">Loading...</div></div>;
    }

    if (status === "unauthenticated") {
        return (
            <div className="section-padding bg-soft" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
                <div className="container" style={{ maxWidth: '500px', textAlign: 'center', background: 'white', padding: '3rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                    <h2 style={{ color: 'var(--primary-teal)', marginBottom: '1.5rem' }}>{dict.booking.title}</h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>{dict.booking.loginRequired || "Please log in to book an appointment."}</p>
                    <button onClick={() => signIn(undefined, { callbackUrl: "/book" })} className="btn btn-primary" style={{ width: '100%' }}>
                        {dict.auth.login.btn || "Log In"}
                    </button>
                    <div style={{ marginTop: '1rem' }}>
                        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>
                            {dict.header.nav.home || "Back to Home"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare next 7 days
    const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

    // Update selected service when language changes if needed (optional but good for consistency)
    useEffect(() => {
        // Reset or re-find service based on index if names change, but simplistic re-init is fine.
        // Ideally we track by ID, but index 0 default is okay for now.
        setSelectedService(SERVICES[0]);
    }, [dict]);


    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/availability");
                if (res.ok) {
                    const data = await res.json();
                    setBookedSlots(data.takenSlots);
                }
            } catch (err) {
                console.error("Error fetching availability:", err);
            }
        }
        fetchData();
    }, [selectedDate]);

    useEffect(() => {
        setTempSelectedSlot(null);
        const generatedSlots = [];
        for (let i = 9; i < 17; i++) {
            const h1 = new Date(selectedDate);
            h1.setHours(i, 0, 0, 0);
            generatedSlots.push(h1);

            const h2 = new Date(selectedDate);
            h2.setHours(i, 30, 0, 0);
            generatedSlots.push(h2);
        }
        setSlots(generatedSlots);
    }, [selectedDate]);

    const handleBooking = async (slot: Date) => {
        setMessage("");

        setLoading(true);
        try {
            const res = await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dateTime: slot.toISOString(),
                    duration: selectedService.duration,
                    price: selectedService.price,
                    notes: `Service: ${selectedService.name}` // Internal note in EN mostly distinct
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Direct redirect to success
                window.location.href = `/book/success`;
            } else {
                setMessage(data.error || dict.booking.error);
            }
        } catch (err) {
            setMessage("Error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const isSlotTaken = (slot: Date, duration: number) => {
        const slotTime = slot.getTime();
        const slotEnd = slotTime + duration * 60 * 1000;

        return bookedSlots.some(booked => {
            const bookedStart = new Date(booked.dateTime).getTime();
            const bookedEnd = bookedStart + booked.duration * 60 * 1000;

            return slotTime < bookedEnd && slotEnd > bookedStart;
        });
    };

    return (
        <div className="section-padding bg-soft" style={{ minHeight: '100vh' }}>
            <div className="container">
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <h1 className="section-title">{dict.booking.title}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{dict.booking.subtitle}</p>
                </div>

                <div className="booking-card">

                    {/* 1. SELECT SERVICE */}
                    <div style={{ marginBottom: '3.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--bg-soft)', paddingBottom: '0.5rem' }}>{dict.booking.step1}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {SERVICES.map(s => (
                                <button
                                    key={s.name}
                                    onClick={() => {
                                        setSelectedService(s);
                                        setTempSelectedSlot(null);
                                    }}
                                    style={{
                                        textAlign: 'left',
                                        padding: '1.5rem',
                                        border: `2px solid ${selectedService.name === s.name ? 'var(--primary-teal)' : 'var(--bg-soft)'}`,
                                        borderRadius: '8px',
                                        background: selectedService.name === s.name ? '#f4f9fa' : 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: selectedService.name === s.name ? 'var(--primary-teal)' : 'var(--text-charcoal)' }}>{s.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{s.duration} min</div>
                                    </div>
                                    <div style={{ fontWeight: '700', color: 'var(--primary-teal)' }}>{s.price} €</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. SELECT DATE */}
                    <div style={{ marginBottom: '3.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--bg-soft)', paddingBottom: '0.5rem' }}>{dict.booking.step2}</h3>
                        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                            {days.map((day) => (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(startOfDay(day))}
                                    style={{
                                        padding: '1rem',
                                        background: startOfDay(day).getTime() === selectedDate.getTime() ? 'var(--primary-teal)' : 'white',
                                        color: startOfDay(day).getTime() === selectedDate.getTime() ? 'white' : 'var(--text-charcoal)',
                                        border: `1px solid ${startOfDay(day).getTime() === selectedDate.getTime() ? 'var(--primary-teal)' : '#ddd'}`,
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        minWidth: '95px',
                                        flexShrink: 0
                                    }}
                                >
                                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>{format(day, "EEE")}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>{format(day, "d")}</div>
                                    <div style={{ fontSize: '0.75rem' }}>{format(day, "MMM")}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. SELECT TIME SLOT */}
                    <div>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--bg-soft)', paddingBottom: '0.5rem' }}>{dict.booking.step3}</h3>
                        {message && <div style={{ padding: '1rem', background: '#fff9c4', color: '#827717', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{message}</div>}

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                            {slots.map((slot) => {
                                const isTaken = isSlotTaken(slot, selectedService.duration);
                                const isSelected = tempSelectedSlot?.getTime() === slot.getTime();

                                return (
                                    <button
                                        key={slot.toISOString()}
                                        onClick={() => !isTaken && setTempSelectedSlot(slot)}
                                        disabled={loading || isTaken}
                                        style={{
                                            padding: '0.75rem',
                                            background: isTaken ? '#fafafa' : (isSelected ? 'var(--primary-teal)' : 'white'),
                                            border: `1px solid ${isTaken ? '#eee' : 'var(--primary-teal)'}`,
                                            borderRadius: '4px',
                                            color: isTaken ? '#ccc' : (isSelected ? 'white' : 'var(--primary-teal)'),
                                            cursor: isTaken ? 'not-allowed' : 'pointer',
                                            fontWeight: '700',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {format(slot, "HH:mm")}
                                        {isTaken && <div style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{dict.booking.taken}</div>}
                                    </button>
                                );
                            })}
                        </div>

                        {tempSelectedSlot && (
                            <div style={{
                                background: 'var(--bg-soft)',
                                padding: '2rem',
                                borderRadius: '4px',
                                textAlign: 'center',
                                border: '1px solid #ddd'
                            }}>
                                <p style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                                    {dict.booking.confirm.text.replace('%s', selectedService.name).replace('%s', format(tempSelectedSlot, "PPP 'at' HH:mm"))}
                                </p>
                                <button
                                    onClick={() => handleBooking(tempSelectedSlot!)}
                                    disabled={loading}
                                    className="btn btn-primary"
                                    style={{ width: '100%', maxWidth: '300px' }}
                                >
                                    {loading ? dict.booking.confirm.loading : dict.booking.confirm.btn}
                                </button>
                            </div>
                        )}
                    </div>

                    {loading && <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--primary-teal)', fontWeight: 'bold' }}>{dict.booking.confirm.loading}</div>}
                </div>
            </div>
        </div>
    );
}

