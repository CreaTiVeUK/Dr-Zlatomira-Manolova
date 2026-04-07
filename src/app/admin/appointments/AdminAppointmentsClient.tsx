"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CheckCircle2, CreditCard, RefreshCw, Search, XCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type AppointmentItem = {
    id: string;
    userId: string;
    patient: string;
    email: string;
    dateLabel: string;
    timeLabel: string;
    isoDate: string;
    duration: number;
    price: number;
    status: string;
    paymentStatus: string;
    notes: string;
    isToday: boolean;
    isPast: boolean;
};

export default function AdminAppointmentsClient({
    appointments,
    summary,
    initialFilters
}: {
    appointments: AppointmentItem[];
    summary: {
        today: number;
        upcoming: number;
        unpaid: number;
        cancelledToday: number;
    };
    initialFilters: {
        scope?: string;
        status?: string;
        payment?: string;
        query?: string;
    };
}) {
    const { language } = useLanguage();
    const router = useRouter();
    const [query, setQuery] = useState(initialFilters.query || "");
    const [statusFilter, setStatusFilter] = useState(initialFilters.status || "ALL");
    const [scopeFilter, setScopeFilter] = useState(initialFilters.scope || "ALL");
    const [paymentFilter, setPaymentFilter] = useState(initialFilters.payment || "ALL");
    const [items, setItems] = useState(appointments);
    const [message, setMessage] = useState("");
    const [pendingId, startTransition] = useTransition();

    const copy = language === "bg" ? {
        title: "Управление на часовете",
        subtitle: "Прегледайте графика, потвърдете приключени посещения и отменете записани часове при нужда.",
        search: "Търсене по пациент, имейл, бележка...",
        allStatuses: "Всички статуси",
        allScopes: "Всички",
        allPayments: "Всички плащания",
        today: "Днес",
        upcoming: "Предстоящи",
        past: "Минали",
        payment: "Плащане",
        noResults: "Няма часове за избраните филтри.",
        openPatient: "Пациент",
        complete: "Приключи",
        cancel: "Отмени",
        refreshing: "Обновяване",
        refresh: "Обнови",
        booked: "Запазен",
        completed: "Приключен",
        cancelled: "Отменен",
        unpaid: "Неплатен",
        paid: "Платен",
        duration: "Продължителност",
        notesFallback: "Няма бележки.",
        todaySummary: "Часове днес",
        upcomingSummary: "Предстоящи",
        unpaidSummary: "Неплатени",
        cancelledSummary: "Отменени днес",
        successComplete: "Часът е отбелязан като приключен.",
        successCancel: "Часът е отменен.",
        failure: "Промяната не бе успешна."
    } : {
        title: "Appointment management",
        subtitle: "Review the schedule, close completed visits, and cancel booked appointments when needed.",
        search: "Search patient, email, or note...",
        allStatuses: "All statuses",
        allScopes: "All",
        allPayments: "All payments",
        today: "Today",
        upcoming: "Upcoming",
        past: "Past",
        payment: "Payment",
        noResults: "No appointments match the current filters.",
        openPatient: "Patient",
        complete: "Complete",
        cancel: "Cancel",
        refreshing: "Refreshing",
        refresh: "Refresh",
        booked: "Booked",
        completed: "Completed",
        cancelled: "Cancelled",
        unpaid: "Unpaid",
        paid: "Paid",
        duration: "Duration",
        notesFallback: "No notes added.",
        todaySummary: "Today",
        upcomingSummary: "Upcoming",
        unpaidSummary: "Unpaid",
        cancelledSummary: "Cancelled today",
        successComplete: "Appointment marked as completed.",
        successCancel: "Appointment cancelled.",
        failure: "The update failed."
    };

    const filteredItems = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return items.filter((appointment) => {
            const matchesQuery = normalized
                ? [appointment.patient, appointment.email, appointment.notes, appointment.status, appointment.paymentStatus]
                    .some((value) => value.toLowerCase().includes(normalized))
                : true;

            const matchesStatus = statusFilter === "ALL" ? true : appointment.status === statusFilter;
            const matchesPayment = paymentFilter === "ALL" ? true : appointment.paymentStatus === paymentFilter;
            const matchesScope = scopeFilter === "ALL"
                ? true
                : scopeFilter === "TODAY"
                    ? appointment.isToday
                    : scopeFilter === "UPCOMING"
                        ? !appointment.isPast && appointment.status !== "CANCELLED"
                        : appointment.isPast || appointment.status === "CANCELLED";

            return matchesQuery && matchesStatus && matchesPayment && matchesScope;
        });
    }, [items, paymentFilter, query, scopeFilter, statusFilter]);

    const summaryCards = [
        { label: copy.todaySummary, value: summary.today, icon: CalendarDays, accent: "#0F4C81" },
        { label: copy.upcomingSummary, value: summary.upcoming, icon: CheckCircle2, accent: "#2563EB" },
        { label: copy.unpaidSummary, value: summary.unpaid, icon: CreditCard, accent: "#B45309" },
        { label: copy.cancelledSummary, value: summary.cancelledToday, icon: XCircle, accent: "#B91C1C" }
    ];

    const updateAppointment = (id: string, status: "COMPLETED" | "CANCELLED") => {
        startTransition(async () => {
            setMessage("");
            try {
                const response = await fetch(`/api/appointments?id=${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status })
                });

                if (!response.ok) {
                    const payload = await response.json().catch(() => ({ error: copy.failure }));
                    setMessage(payload.error || copy.failure);
                    return;
                }

                setItems((current) => current.map((appointment) => appointment.id === id ? { ...appointment, status } : appointment));
                setMessage(status === "COMPLETED" ? copy.successComplete : copy.successCancel);
                router.refresh();
            } catch {
                setMessage(copy.failure);
            }
        });
    };

    return (
        <div className="admin-appointments-shell">
            <div className="container admin-appointments-grid">
                <div className="admin-appointments-header">
                    <div>
                        <h1 className="section-title" style={{ marginBottom: "1rem" }}>{copy.title}</h1>
                        <p style={{ color: "var(--text-muted)", maxWidth: 760 }}>{copy.subtitle}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.refresh()}
                        className="btn btn-outline"
                        style={{ gap: "0.6rem" }}
                    >
                        <RefreshCw size={16} />
                        {pendingId ? copy.refreshing : copy.refresh}
                    </button>
                </div>

                {message && (
                    <div className="admin-appointments-message">
                        {message}
                    </div>
                )}

                <div className="admin-appointments-summary">
                    {summaryCards.map((card) => (
                        <div key={card.label} className="admin-appointments-summary-card">
                            <span style={{ width: 40, height: 40, borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", background: `${card.accent}18`, color: card.accent }}>
                                <card.icon size={18} />
                            </span>
                            <strong style={{ fontSize: "1.45rem" }}>{card.value}</strong>
                            <p style={{ color: "var(--text-muted)" }}>{card.label}</p>
                        </div>
                    ))}
                </div>

                <div className="admin-appointments-panel">
                    <div className="admin-appointments-filters">
                        <label className="admin-appointments-search">
                            <Search size={16} color="var(--text-muted)" />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder={copy.search}
                                style={{ width: "100%", border: 0, outline: 0, background: "transparent", color: "var(--text-charcoal)" }}
                            />
                        </label>

                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-focus" style={selectStyle}>
                            <option value="ALL">{copy.allStatuses}</option>
                            <option value="BOOKED">{copy.booked}</option>
                            <option value="COMPLETED">{copy.completed}</option>
                            <option value="CANCELLED">{copy.cancelled}</option>
                        </select>

                        <select value={scopeFilter} onChange={(event) => setScopeFilter(event.target.value)} className="input-focus" style={selectStyle}>
                            <option value="ALL">{copy.allScopes}</option>
                            <option value="TODAY">{copy.today}</option>
                            <option value="UPCOMING">{copy.upcoming}</option>
                            <option value="PAST">{copy.past}</option>
                        </select>

                        <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value)} className="input-focus" style={selectStyle}>
                            <option value="ALL">{copy.allPayments}</option>
                            <option value="PAID">{copy.paid}</option>
                            <option value="UNPAID">{copy.unpaid}</option>
                        </select>
                    </div>

                    <div className="admin-appointments-list">
                        {filteredItems.length === 0 ? (
                            <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>{copy.noResults}</div>
                        ) : (
                            filteredItems.map((appointment) => {
                                const busy = Boolean(pendingId) && pendingId === true;
                                return (
                                    <article key={appointment.id} className="admin-appointments-card">
                                        <div style={{ display: "grid", gap: "0.65rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                                                <div>
                                                    <h3 style={{ fontSize: "1rem", marginBottom: "0.15rem" }}>{appointment.patient}</h3>
                                                    <p style={{ color: "var(--text-muted)", fontSize: "0.92rem" }}>{appointment.email}</p>
                                                </div>
                                                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                                                    <Badge label={appointment.status} />
                                                    <Badge label={appointment.paymentStatus} payment />
                                                </div>
                                            </div>

                                            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", color: "var(--text-muted)", fontSize: "0.92rem" }}>
                                                <span>{appointment.dateLabel}</span>
                                                <span>{appointment.timeLabel}</span>
                                                <span>{copy.duration}: {appointment.duration} min</span>
                                                <span>{appointment.price.toFixed(0)} €</span>
                                            </div>

                                            <p style={{ color: "var(--text-charcoal)" }}>{appointment.notes || copy.notesFallback}</p>
                                        </div>

                                        <div className="admin-appointments-actions">
                                            <Link href={`/admin/users/${appointment.userId}`} className="btn btn-outline" style={{ minHeight: 40, padding: "0.7rem 1rem" }}>
                                                {copy.openPatient}
                                            </Link>
                                            {appointment.status === "BOOKED" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateAppointment(appointment.id, "COMPLETED")}
                                                        className="btn btn-primary"
                                                        style={{ minHeight: 40, padding: "0.7rem 1rem" }}
                                                        disabled={busy}
                                                    >
                                                        {copy.complete}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateAppointment(appointment.id, "CANCELLED")}
                                                        className="btn"
                                                        style={{ minHeight: 40, padding: "0.7rem 1rem", background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3" }}
                                                        disabled={busy}
                                                    >
                                                        {copy.cancel}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .admin-appointments-shell {
                    display: grid;
                    gap: 1.25rem;
                }
                .admin-appointments-grid {
                    display: grid;
                    gap: 1.25rem;
                }
                .admin-appointments-header {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    align-items: flex-start;
                    flex-wrap: wrap;
                }
                .admin-appointments-message,
                .admin-appointments-summary-card,
                .admin-appointments-panel,
                .admin-appointments-card {
                    background: var(--surface-elevated);
                    border: 1px solid var(--border-card);
                    box-shadow: var(--shadow-sm);
                }
                .admin-appointments-message {
                    padding: 0.9rem 1rem;
                    border-radius: 16px;
                }
                .admin-appointments-summary {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 1rem;
                }
                .admin-appointments-summary-card {
                    border-radius: 20px;
                    padding: 1rem 1.1rem;
                    display: grid;
                    gap: 0.4rem;
                }
                .admin-appointments-panel {
                    border-radius: 24px;
                    padding: 1.25rem;
                    display: grid;
                    gap: 1rem;
                }
                .admin-appointments-filters {
                    display: grid;
                    grid-template-columns: minmax(0, 1.4fr) repeat(3, minmax(0, 180px));
                    gap: 0.75rem;
                }
                .admin-appointments-search {
                    display: flex;
                    align-items: center;
                    gap: 0.7rem;
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 0 0.9rem;
                    min-height: 50px;
                    background: color-mix(in srgb, var(--surface-card-strong) 92%, transparent 8%);
                }
                .admin-appointments-list {
                    display: grid;
                    gap: 0.9rem;
                }
                .admin-appointments-card {
                    display: grid;
                    grid-template-columns: minmax(0, 1fr) auto;
                    gap: 1rem;
                    align-items: center;
                    padding: 1rem;
                    border-radius: 20px;
                    background: color-mix(in srgb, var(--surface-card-strong) 84%, transparent 16%);
                }
                .admin-appointments-actions {
                    display: grid;
                    gap: 0.6rem;
                    justify-items: stretch;
                    min-width: 144px;
                }
                :global(.dark) .admin-appointments-card {
                    background: color-mix(in srgb, var(--surface-card-strong) 74%, transparent 26%);
                }
                @media (max-width: 980px) {
                    .admin-appointments-summary {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                    .admin-appointments-header {
                        align-items: stretch;
                    }
                    .admin-appointments-filters {
                        grid-template-columns: 1fr;
                    }
                    .admin-appointments-card {
                        grid-template-columns: 1fr;
                    }
                    .admin-appointments-actions {
                        min-width: 0;
                    }
                }
                @media (max-width: 640px) {
                    .admin-appointments-summary {
                        grid-template-columns: 1fr;
                    }
                    .admin-appointments-panel,
                    .admin-appointments-card,
                    .admin-appointments-summary-card {
                        padding: 0.95rem;
                    }
                    .admin-appointments-actions {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

function Badge({ label, payment = false }: { label: string; payment?: boolean }) {
    const tones: Record<string, { background: string; color: string }> = {
        BOOKED: { background: "rgba(37,99,235,0.12)", color: "#1D4ED8" },
        COMPLETED: { background: "rgba(21,128,61,0.12)", color: "#15803D" },
        CANCELLED: { background: "rgba(185,28,28,0.12)", color: "#B91C1C" },
        PAID: { background: "rgba(21,128,61,0.12)", color: "#15803D" },
        UNPAID: { background: "rgba(245,158,11,0.14)", color: "#B45309" }
    };
    const tone = tones[label] || (payment ? { background: "rgba(245,158,11,0.14)", color: "#B45309" } : { background: "rgba(15,76,129,0.12)", color: "#0F4C81" });
    return (
        <span style={{ display: "inline-flex", alignItems: "center", minHeight: 30, padding: "0 0.7rem", borderRadius: 999, background: tone.background, color: tone.color, fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.04em" }}>
            {label}
        </span>
    );
}

const selectStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 50,
    borderRadius: 16,
    border: "1px solid var(--border)",
    padding: "0 0.9rem",
    background: "var(--bg-white)",
    color: "var(--text-charcoal)",
    outline: 0
};
