"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {
    Activity,
    ArrowRight,
    Bell,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    FileText,
    Search,
    Stethoscope,
    UserRound,
    Users
} from "lucide-react";

type DashboardProps = {
    adminName: string;
    stats: {
        todayAppointments: number;
        upcomingAppointments: number;
        patients: number;
        unpaidAppointments: number;
        monthRevenue: number;
        documents: number;
    };
    alerts: {
        id: string;
        tone: "info" | "warning" | "success";
        title: string;
        description: string;
        href: string;
        cta: string;
    }[];
    todaySchedule: {
        id: string;
        userId: string;
        patient: string;
        email: string;
        time: string;
        status: string;
        paymentStatus: string;
        duration: number;
        notes: string;
    }[];
    upcomingQueue: {
        id: string;
        userId: string;
        patient: string;
        dateLabel: string;
        timeLabel: string;
        status: string;
        paymentStatus: string;
        notes: string;
        duration: number;
    }[];
    recentPatients: {
        id: string;
        name: string;
        joinedLabel: string;
        appointmentsCount: number;
        documentsCount: number;
        childrenCount: number;
    }[];
    recentActivity: {
        id: string;
        userId: string;
        patient: string;
        eventLabel: string;
        timestampLabel: string;
        status: string;
    }[];
    monthlyVisits: {
        name: string;
        visits: number;
    }[];
    appointmentTypes: {
        name: string;
        value: number;
    }[];
};

const CHART_COLORS = ["#0F4C81", "#2C7FB8", "#F59E0B"];
const emptySubscribe = () => () => {};

function toAppointmentSearch(params: Record<string, string>) {
    return `/admin/appointments?${new URLSearchParams(params).toString()}`;
}

export default function AdminDashboardClient({
    adminName,
    stats,
    alerts,
    todaySchedule,
    upcomingQueue,
    recentPatients,
    recentActivity,
    monthlyVisits,
    appointmentTypes
}: DashboardProps) {
    const { resolvedTheme } = useTheme();
    const { language, toggleLanguage } = useLanguage();
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
    const [searchQuery, setSearchQuery] = useState("");
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const copy = language === "bg" ? {
        greeting: "Административно табло",
        subtitle: "Бърз достъп до графика, пациентите и задачите, които изискват внимание днес.",
        searchPlaceholder: "Търсене по пациент, бележка или статус...",
        alerts: "Сигнали",
        quickActions: "Бързи действия",
        todaySchedule: "График за днес",
        upcoming: "Следващи посещения",
        recentPatients: "Нови и активни пациенти",
        recentActivity: "Последна активност",
        monthlyVisits: "Посещения за последните 6 месеца",
        appointmentMix: "Разпределение по продължителност",
        noMatches: "Няма резултати за текущото търсене.",
        noSchedule: "Няма записани посещения за днес.",
        noUpcoming: "Няма предстоящи записани посещения.",
        noRecentPatients: "Няма нови пациенти.",
        noActivity: "Няма последна активност.",
        notifications: "Известия",
        open: "Отвори",
        openPatient: "Пациент",
        manage: "Управление",
        sessionLogs: "Сесии",
        patientRecords: "Пациенти",
        todayAppointments: "Часове днес",
        upcomingAppointments: "Предстоящи",
        totalPatients: "Пациенти",
        unpaid: "Неплатени",
        monthRevenue: "Приход за месеца",
        documents: "Документи",
        bookVisit: "Нов час",
        viewSchedule: "График",
        viewPatients: "Досиета",
        openSessions: "Лог на сесии",
        duration: "Продължителност",
        notesFallback: "Няма добавени бележки.",
        joined: "Регистриран",
        children: "Деца",
        visits: "Посещения",
        docs: "Документи",
        mark: "Статус",
        allAlertsRead: "Всички сигнали са прегледани."
    } : {
        greeting: "Admin command center",
        subtitle: "Start from the schedule, patient records, and the tasks that need attention today.",
        searchPlaceholder: "Search by patient, note, or status...",
        alerts: "Alerts",
        quickActions: "Quick actions",
        todaySchedule: "Today's schedule",
        upcoming: "Next appointments",
        recentPatients: "New and active patients",
        recentActivity: "Recent activity",
        monthlyVisits: "Visits over the last 6 months",
        appointmentMix: "Duration mix",
        noMatches: "No items match the current search.",
        noSchedule: "No appointments are booked for today.",
        noUpcoming: "No upcoming booked appointments.",
        noRecentPatients: "No recent patients found.",
        noActivity: "No recent activity yet.",
        notifications: "Notifications",
        open: "Open",
        openPatient: "Patient",
        manage: "Manage",
        sessionLogs: "Sessions",
        patientRecords: "Patients",
        todayAppointments: "Today",
        upcomingAppointments: "Upcoming",
        totalPatients: "Patients",
        unpaid: "Unpaid",
        monthRevenue: "This month",
        documents: "Documents",
        bookVisit: "Book visit",
        viewSchedule: "View schedule",
        viewPatients: "Patient records",
        openSessions: "Session logs",
        duration: "Duration",
        notesFallback: "No notes added.",
        joined: "Joined",
        children: "Children",
        visits: "Visits",
        docs: "Docs",
        mark: "Status",
        allAlertsRead: "All alerts reviewed."
    };

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const isDark = mounted && resolvedTheme === "dark";

    const filteredTodaySchedule = useMemo(() => {
        return todaySchedule.filter((appointment) => {
            if (!normalizedQuery) return true;
            return [
                appointment.patient,
                appointment.notes,
                appointment.status,
                appointment.paymentStatus,
                appointment.time
            ].some((value) => value.toLowerCase().includes(normalizedQuery));
        });
    }, [normalizedQuery, todaySchedule]);

    const filteredUpcoming = useMemo(() => {
        return upcomingQueue.filter((appointment) => {
            if (!normalizedQuery) return true;
            return [
                appointment.patient,
                appointment.notes,
                appointment.status,
                appointment.paymentStatus,
                appointment.dateLabel,
                appointment.timeLabel
            ].some((value) => value.toLowerCase().includes(normalizedQuery));
        });
    }, [normalizedQuery, upcomingQueue]);

    const filteredRecentPatients = useMemo(() => {
        return recentPatients.filter((patient) => {
            if (!normalizedQuery) return true;
            return patient.name.toLowerCase().includes(normalizedQuery);
        });
    }, [normalizedQuery, recentPatients]);

    const filteredRecentActivity = useMemo(() => {
        return recentActivity.filter((item) => {
            if (!normalizedQuery) return true;
            return [item.patient, item.eventLabel, item.status].some((value) => value.toLowerCase().includes(normalizedQuery));
        });
    }, [normalizedQuery, recentActivity]);

    const quickActions = [
        { href: toAppointmentSearch({ scope: "TODAY" }), label: copy.viewSchedule, description: copy.todaySchedule, icon: CalendarDays },
        { href: "/admin/users", label: copy.viewPatients, description: copy.patientRecords, icon: Users },
        { href: "/admin/sessions", label: copy.openSessions, description: copy.sessionLogs, icon: Stethoscope },
        { href: toAppointmentSearch({ scope: "UPCOMING", payment: "UNPAID" }), label: copy.bookVisit, description: copy.unpaid, icon: ClipboardList }
    ];

    const metricCards = [
        { label: copy.todayAppointments, value: stats.todayAppointments, icon: CalendarDays, href: toAppointmentSearch({ scope: "TODAY" }), accent: "#0F4C81" },
        { label: copy.upcomingAppointments, value: stats.upcomingAppointments, icon: Activity, href: toAppointmentSearch({ scope: "UPCOMING", status: "BOOKED" }), accent: "#2563EB" },
        { label: copy.totalPatients, value: stats.patients, icon: Users, href: "/admin/users", accent: "#0F766E" },
        { label: copy.unpaid, value: stats.unpaidAppointments, icon: CreditCard, href: toAppointmentSearch({ scope: "UPCOMING", payment: "UNPAID" }), accent: "#B45309" },
        { label: copy.monthRevenue, value: `£${stats.monthRevenue.toFixed(0)}`, icon: CheckCircle2, href: toAppointmentSearch({ status: "COMPLETED", payment: "PAID" }), accent: "#15803D" },
        { label: copy.documents, value: stats.documents, icon: FileText, href: "/admin/sessions", accent: "#7C3AED" }
    ];

    return (
        <div className={`admin-dashboard-shell ${isDark ? "theme-dark" : "theme-light"}`}>
            <section className="admin-dashboard-hero">
                <div>
                    <p className="admin-dashboard-kicker">{copy.greeting}</p>
                    <h1>{adminName}</h1>
                    <p className="admin-dashboard-subtitle">{copy.subtitle}</p>
                </div>

                <div className="admin-dashboard-controls">
                    <button className="admin-dashboard-lang" onClick={toggleLanguage} title="Switch language">
                        {language === "en" ? "BG" : "EN"}
                    </button>
                    <ThemeToggle />
                    <button className="admin-dashboard-alerts-toggle" onClick={() => setNotificationsOpen((open) => !open)}>
                        <Bell size={18} />
                        <span>{copy.alerts}</span>
                        {alerts.length > 0 && <strong>{alerts.length}</strong>}
                    </button>
                    {notificationsOpen && (
                        <div className="admin-dashboard-alerts-dropdown">
                            <div className="admin-dashboard-alerts-header">
                                <strong>{copy.notifications}</strong>
                                <span>{alerts.length > 0 ? `${alerts.length} ${copy.alerts.toLowerCase()}` : copy.allAlertsRead}</span>
                            </div>
                            {alerts.length === 0 ? (
                                <div className="admin-dashboard-alerts-empty">{copy.allAlertsRead}</div>
                            ) : (
                                <div className="admin-dashboard-alerts-list">
                                    {alerts.map((alert) => (
                                        <Link key={alert.id} href={alert.href} className="admin-dashboard-alerts-link" onClick={() => setNotificationsOpen(false)}>
                                            <div className="admin-dashboard-alerts-item">
                                                <strong>{alert.title}</strong>
                                                <span>{alert.description}</span>
                                                <em>{alert.cta}</em>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="admin-dashboard-search">
                <Search size={18} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={copy.searchPlaceholder}
                />
            </section>

            <section className="admin-dashboard-metrics">
                {metricCards.map((card) => (
                    <Link key={card.label} href={card.href} className="admin-metric-card">
                        <span className="admin-metric-icon" style={{ background: `${card.accent}18`, color: card.accent }}>
                            <card.icon size={20} />
                        </span>
                        <div>
                            <p>{card.label}</p>
                            <strong>{card.value}</strong>
                        </div>
                        <ArrowRight size={16} className="admin-metric-arrow" />
                    </Link>
                ))}
            </section>

            <section className="admin-dashboard-top-grid">
                <div className="admin-panel admin-panel-highlight">
                    <div className="admin-panel-header">
                        <h2>{copy.quickActions}</h2>
                    </div>
                    <div className="admin-quick-actions">
                        {quickActions.map((action) => (
                            <Link key={action.href} href={action.href} className="admin-quick-action">
                                <span><action.icon size={18} /></span>
                                <div>
                                    <strong>{action.label}</strong>
                                    <p>{action.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="admin-panel">
                    <div className="admin-panel-header">
                        <h2>{copy.alerts}</h2>
                    </div>
                    <div className="admin-alert-list">
                        {alerts.map((alert) => (
                            <Link key={alert.id} href={alert.href} className={`admin-alert-card tone-${alert.tone}`}>
                                <div>
                                    <strong>{alert.title}</strong>
                                    <p>{alert.description}</p>
                                </div>
                                <span>{alert.cta}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="admin-dashboard-main-grid">
                <div className="admin-panel">
                    <div className="admin-panel-header">
                        <h2>{copy.todaySchedule}</h2>
                        <Link href={toAppointmentSearch({ scope: "TODAY" })} className="admin-panel-link">{copy.manage}</Link>
                    </div>
                    <div className="admin-timeline">
                        {filteredTodaySchedule.length === 0 ? (
                            <p className="admin-empty-state">{normalizedQuery ? copy.noMatches : copy.noSchedule}</p>
                        ) : (
                            filteredTodaySchedule.map((appointment) => (
                                <article key={appointment.id} className="admin-timeline-card">
                                    <div className="admin-timeline-time">
                                        <strong>{appointment.time}</strong>
                                        <span>{appointment.duration} min</span>
                                    </div>
                                    <div className="admin-timeline-body">
                                        <div className="admin-timeline-title-row">
                                            <div>
                                                <h3>{appointment.patient}</h3>
                                                <p>{appointment.notes || copy.notesFallback}</p>
                                            </div>
                                            <div className="admin-badge-stack">
                                                <StatusBadge label={appointment.status} />
                                                <StatusBadge label={appointment.paymentStatus} payment />
                                            </div>
                                        </div>
                                        <div className="admin-timeline-actions">
                                            <Link href={`/admin/users/${appointment.userId}`}>{copy.openPatient}</Link>
                                            <Link href={toAppointmentSearch({ query: appointment.patient, scope: "TODAY" })}>{copy.manage}</Link>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>

                <div className="admin-side-column">
                    <div className="admin-panel">
                        <div className="admin-panel-header">
                            <h2>{copy.upcoming}</h2>
                            <Link href={toAppointmentSearch({ scope: "UPCOMING", status: "BOOKED" })} className="admin-panel-link">{copy.viewSchedule}</Link>
                        </div>
                        <div className="admin-compact-list">
                            {filteredUpcoming.length === 0 ? (
                                <p className="admin-empty-state">{normalizedQuery ? copy.noMatches : copy.noUpcoming}</p>
                            ) : (
                                filteredUpcoming.map((appointment) => (
                                    <div key={appointment.id} className="admin-compact-item">
                                        <div>
                                            <strong>{appointment.patient}</strong>
                                            <p>{appointment.dateLabel} • {appointment.timeLabel} • {appointment.duration} min</p>
                                        </div>
                                        <Link href={`/admin/users/${appointment.userId}`}>{copy.open}</Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="admin-panel">
                        <div className="admin-panel-header">
                            <h2>{copy.recentActivity}</h2>
                        </div>
                        <div className="admin-compact-list">
                            {filteredRecentActivity.length === 0 ? (
                                <p className="admin-empty-state">{normalizedQuery ? copy.noMatches : copy.noActivity}</p>
                            ) : (
                                filteredRecentActivity.map((item) => (
                                    <div key={item.id} className="admin-compact-item">
                                        <div>
                                            <strong>{item.patient}</strong>
                                            <p>{item.eventLabel}</p>
                                            <small>{item.timestampLabel}</small>
                                        </div>
                                        <StatusBadge label={item.status} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="admin-dashboard-bottom-grid">
                <div className="admin-panel">
                    <div className="admin-panel-header">
                        <h2>{copy.recentPatients}</h2>
                        <Link href="/admin/users" className="admin-panel-link">{copy.viewPatients}</Link>
                    </div>
                    <div className="admin-patient-grid">
                        {filteredRecentPatients.length === 0 ? (
                            <p className="admin-empty-state">{normalizedQuery ? copy.noMatches : copy.noRecentPatients}</p>
                        ) : (
                            filteredRecentPatients.map((patient) => (
                                <Link key={patient.id} href={`/admin/users/${patient.id}`} className="admin-patient-card">
                                    <div className="admin-patient-avatar">
                                        <UserRound size={18} />
                                    </div>
                                    <div>
                                        <strong>{patient.name}</strong>
                                        <p>{copy.joined}: {patient.joinedLabel}</p>
                                        <small>{patient.appointmentsCount} {copy.visits} • {patient.documentsCount} {copy.docs} • {patient.childrenCount} {copy.children}</small>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                <div className="admin-panel admin-chart-panel">
                    <div className="admin-panel-header">
                        <h2>{copy.monthlyVisits}</h2>
                    </div>
                    <div className="admin-chart-wrap">
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={monthlyVisits}>
                                    <defs>
                                        <linearGradient id="adminVisitsFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.28} />
                                            <stop offset="95%" stopColor="#0F4C81" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: "var(--bg-white)", border: "1px solid var(--border)", borderRadius: 12 }} />
                                    <Area type="monotone" dataKey="visits" stroke="#0F4C81" strokeWidth={3} fill="url(#adminVisitsFill)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="admin-chart-placeholder" aria-hidden="true" />
                        )}
                    </div>
                </div>

                <div className="admin-panel admin-chart-panel">
                    <div className="admin-panel-header">
                        <h2>{copy.appointmentMix}</h2>
                    </div>
                    <div className="admin-chart-wrap">
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie data={appointmentTypes} dataKey="value" innerRadius={50} outerRadius={74} paddingAngle={4}>
                                        {appointmentTypes.map((entry, index) => (
                                            <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: "var(--bg-white)", border: "1px solid var(--border)", borderRadius: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="admin-chart-placeholder" aria-hidden="true" />
                        )}
                    </div>
                    <div className="admin-chart-legend">
                        {appointmentTypes.map((item, index) => (
                            <div key={item.name}>
                                <span style={{ background: CHART_COLORS[index % CHART_COLORS.length] }} />
                                <strong>{item.name}</strong>
                                <small>{item.value}</small>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <style jsx>{`
                .admin-dashboard-shell {
                    display: grid;
                    gap: 1.5rem;
                    color: var(--text-charcoal);
                }
                .admin-dashboard-hero {
                    position: relative;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 1.5rem;
                    padding: 1.75rem;
                    border-radius: 26px;
                    background: var(--surface-elevated);
                    color: var(--text-charcoal);
                    box-shadow: var(--shadow-sm);
                    overflow: visible;
                    border: 1px solid var(--border-card);
                }
                .theme-dark .admin-dashboard-hero {
                    background: var(--surface-elevated);
                }
                .admin-dashboard-kicker {
                    text-transform: uppercase;
                    letter-spacing: 0.16em;
                    font-size: 0.74rem;
                    color: var(--text-soft);
                    margin-bottom: 0.75rem;
                }
                .admin-dashboard-hero h1 {
                    color: var(--text-charcoal);
                    font-size: clamp(2rem, 4vw, 3rem);
                    margin-bottom: 0.55rem;
                }
                .admin-dashboard-subtitle {
                    max-width: 48rem;
                    color: var(--text-muted);
                }
                .admin-dashboard-controls {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    position: relative;
                    flex-wrap: wrap;
                    justify-content: flex-end;
                }
                .admin-dashboard-lang,
                .admin-dashboard-alerts-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    height: 42px;
                    padding: 0 0.95rem;
                    border-radius: 999px;
                    border: 1px solid var(--border);
                    background: color-mix(in srgb, var(--surface-card-strong) 92%, transparent 8%);
                    color: var(--text-charcoal);
                    cursor: pointer;
                    transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
                }
                .admin-dashboard-lang:hover,
                .admin-dashboard-alerts-toggle:hover {
                    transform: translateY(-1px);
                    background: color-mix(in srgb, var(--primary-teal) 8%, var(--surface-card-strong) 92%);
                    border-color: color-mix(in srgb, var(--primary-teal) 24%, transparent 76%);
                }
                .admin-dashboard-alerts-toggle strong {
                    width: 24px;
                    height: 24px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 999px;
                    background: color-mix(in srgb, var(--primary-teal) 12%, transparent 88%);
                    font-size: 0.8rem;
                    color: var(--primary-teal);
                }
                .admin-dashboard-alerts-dropdown {
                    position: absolute;
                    top: calc(100% + 0.75rem);
                    right: 0;
                    width: min(420px, 92vw);
                    padding: 0.9rem;
                    border-radius: 22px;
                    background: var(--surface-elevated);
                    color: var(--text-charcoal);
                    box-shadow: var(--shadow-md);
                    z-index: 20;
                    border: 1px solid var(--border-card);
                }
                .admin-dashboard-alerts-header {
                    display: grid;
                    gap: 0.2rem;
                    padding: 0.35rem 0.45rem 0.8rem;
                    border-bottom: 1px solid color-mix(in srgb, var(--border) 78%, transparent 22%);
                    margin-bottom: 0.45rem;
                }
                .admin-dashboard-alerts-header strong {
                    font-size: 0.98rem;
                }
                .admin-dashboard-alerts-header span {
                    color: var(--text-soft);
                    font-size: 0.82rem;
                }
                .admin-dashboard-alerts-list {
                    display: grid;
                    gap: 0.65rem;
                }
                :global(.admin-dashboard-alerts-link) {
                    display: block;
                }
                .admin-dashboard-alerts-item,
                .admin-dashboard-alerts-empty {
                    display: grid;
                    gap: 0.3rem;
                    padding: 0.9rem 0.85rem;
                    border-radius: 16px;
                    border: 1px solid transparent;
                    background: color-mix(in srgb, var(--surface-card-strong) 86%, transparent 14%);
                    text-align: left;
                }
                :global(.admin-dashboard-alerts-link:hover) .admin-dashboard-alerts-item {
                    background: color-mix(in srgb, var(--primary-teal) 5%, var(--surface-card-strong) 95%);
                    border-color: color-mix(in srgb, var(--primary-teal) 14%, transparent 86%);
                }
                .admin-dashboard-alerts-item strong {
                    font-size: 0.93rem;
                    line-height: 1.35;
                }
                .admin-dashboard-alerts-item span,
                .admin-dashboard-alerts-empty {
                    color: var(--text-muted);
                    font-size: 0.88rem;
                    line-height: 1.5;
                }
                .admin-dashboard-alerts-item em {
                    color: var(--primary-teal);
                    font-style: normal;
                    font-weight: 700;
                    font-size: 0.82rem;
                    letter-spacing: 0.01em;
                }
                .admin-dashboard-search {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0 1.1rem;
                    height: 56px;
                    border-radius: 18px;
                    background: color-mix(in srgb, var(--surface-card-strong) 92%, transparent 8%);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-sm);
                }
                .admin-dashboard-search input {
                    width: 100%;
                    border: 0;
                    outline: 0;
                    background: transparent;
                    color: var(--text-charcoal);
                    font-size: 0.98rem;
                }
                .admin-dashboard-metrics,
                .admin-dashboard-top-grid,
                .admin-dashboard-main-grid,
                .admin-dashboard-bottom-grid {
                    display: grid;
                    gap: 1rem;
                }
                .admin-dashboard-metrics {
                    grid-template-columns: repeat(6, minmax(0, 1fr));
                }
                .admin-dashboard-top-grid {
                    grid-template-columns: 1.25fr 1fr;
                }
                .admin-dashboard-main-grid {
                    grid-template-columns: 1.3fr 0.9fr;
                    align-items: start;
                }
                .admin-dashboard-bottom-grid {
                    grid-template-columns: 1.1fr 1fr 0.9fr;
                    align-items: start;
                }
                .admin-metric-card,
                .admin-panel,
                .admin-patient-card,
                .admin-quick-action,
                .admin-alert-card {
                    background: var(--surface-elevated);
                    border: 1px solid var(--border-card);
                    box-shadow: var(--shadow-sm);
                }
                .admin-metric-card {
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    align-items: center;
                    gap: 0.9rem;
                    padding: 1rem 1.1rem;
                    border-radius: 20px;
                    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
                }
                .admin-metric-card:hover,
                .admin-patient-card:hover,
                .admin-quick-action:hover,
                .admin-alert-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 22px 44px rgba(15, 23, 42, 0.10);
                    border-color: rgba(49, 130, 206, 0.24);
                }
                .admin-metric-card p {
                    color: var(--text-muted);
                    font-size: 0.84rem;
                    margin-bottom: 0.2rem;
                }
                .admin-metric-card strong {
                    font-size: 1.4rem;
                }
                .admin-metric-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 14px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                .admin-metric-arrow {
                    color: var(--text-muted);
                }
                .admin-panel {
                    padding: 1.35rem;
                    border-radius: 26px;
                }
                .admin-panel-highlight {
                    background: var(--surface-elevated);
                }
                .admin-panel-header {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .admin-panel-header h2 {
                    font-size: 1.05rem;
                    margin: 0;
                }
                .admin-panel-link {
                    color: var(--accent-bluish);
                    font-weight: 700;
                    font-size: 0.9rem;
                }
                .admin-quick-actions,
                .admin-alert-list,
                .admin-timeline,
                .admin-compact-list,
                .admin-patient-grid,
                .admin-chart-legend,
                .admin-side-column {
                    display: grid;
                    gap: 0.85rem;
                }
                .admin-quick-actions {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
                .admin-quick-action {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 0.9rem;
                    padding: 1rem;
                    border-radius: 18px;
                }
                .admin-quick-action span {
                    width: 42px;
                    height: 42px;
                    border-radius: 14px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(15, 76, 129, 0.10);
                    color: #0F4C81;
                }
                .admin-quick-action p,
                .admin-alert-card p,
                .admin-timeline-body p,
                .admin-compact-item p,
                .admin-patient-card p,
                .admin-patient-card small,
                .admin-empty-state {
                    color: var(--text-muted);
                }
                .admin-alert-card {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    padding: 1rem;
                    border-radius: 18px;
                    align-items: center;
                }
                .admin-alert-card span {
                    color: var(--accent-bluish);
                    font-weight: 700;
                    white-space: nowrap;
                }
                .tone-warning {
                    border-color: rgba(245, 158, 11, 0.35);
                    background: linear-gradient(180deg, rgba(245, 158, 11, 0.10), rgba(245, 158, 11, 0.05));
                }
                .tone-success {
                    border-color: rgba(34, 197, 94, 0.35);
                    background: linear-gradient(180deg, rgba(34, 197, 94, 0.09), rgba(34, 197, 94, 0.04));
                }
                .tone-info {
                    border-color: rgba(37, 99, 235, 0.22);
                    background: linear-gradient(180deg, rgba(37, 99, 235, 0.08), rgba(37, 99, 235, 0.03));
                }
                .admin-timeline-card {
                    display: grid;
                    grid-template-columns: 88px 1fr;
                    gap: 1rem;
                    padding: 1.05rem;
                    border-radius: 22px;
                    background: ${isDark ? "linear-gradient(180deg, rgba(30,41,59,0.72), rgba(15,23,42,0.64))" : "linear-gradient(180deg, rgba(255,255,255,0.82), rgba(248,250,252,0.96))"};
                    border: 1px solid ${isDark ? "rgba(148,163,184,0.14)" : "rgba(148,163,184,0.18)"};
                    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
                }
                .admin-timeline-time {
                    display: grid;
                    align-content: start;
                    gap: 0.15rem;
                    color: var(--text-muted);
                    font-size: 0.88rem;
                }
                .admin-timeline-time strong,
                .admin-timeline-body h3 {
                    color: var(--text-charcoal);
                }
                .admin-timeline-title-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                }
                .admin-badge-stack,
                .admin-timeline-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    align-items: center;
                }
                .admin-timeline-actions {
                    margin-top: 0.8rem;
                }
                .admin-timeline-actions a,
                .admin-compact-item a {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 36px;
                    padding: 0 0.85rem;
                    border-radius: 999px;
                    background: rgba(15, 76, 129, 0.10);
                    color: #0F4C81;
                    font-weight: 700;
                    font-size: 0.86rem;
                    transition: transform 0.2s ease, background 0.2s ease;
                }
                .admin-timeline-actions a:hover,
                .admin-compact-item a:hover {
                    transform: translateY(-1px);
                    background: rgba(15, 76, 129, 0.16);
                }
                .admin-compact-item {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    align-items: center;
                    padding: 0.9rem 0;
                    border-bottom: 1px solid var(--border);
                }
                .admin-compact-item:last-child {
                    border-bottom: 0;
                    padding-bottom: 0;
                }
                .admin-compact-item small {
                    color: var(--text-muted);
                }
                .admin-patient-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
                .admin-patient-card {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 0.85rem;
                    padding: 1rem;
                    border-radius: 18px;
                }
                .admin-patient-avatar {
                    width: 42px;
                    height: 42px;
                    border-radius: 14px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(15, 76, 129, 0.10);
                    color: #0F4C81;
                }
                .admin-chart-panel {
                    min-height: 100%;
                }
                .admin-chart-wrap {
                    width: 100%;
                    height: 260px;
                    min-width: 0;
                }
                .admin-chart-placeholder {
                    width: 100%;
                    height: 100%;
                    border-radius: 20px;
                    background: color-mix(in srgb, var(--surface-card-strong) 72%, transparent 28%);
                    border: 1px dashed color-mix(in srgb, var(--border) 80%, transparent 20%);
                }
                .admin-chart-legend div {
                    display: grid;
                    grid-template-columns: auto 1fr auto;
                    gap: 0.6rem;
                    align-items: center;
                    font-size: 0.9rem;
                }
                .admin-chart-legend span {
                    width: 10px;
                    height: 10px;
                    border-radius: 999px;
                }
                .theme-dark .admin-quick-action span,
                .theme-dark .admin-patient-avatar,
                .theme-dark .admin-timeline-actions a,
                .theme-dark .admin-compact-item a {
                    background: rgba(96, 165, 250, 0.12);
                    color: #7dd3fc;
                }
                .theme-dark .admin-panel-link,
                .theme-dark .admin-alert-card span,
                .theme-dark .admin-metric-arrow {
                    color: #7dd3fc;
                }
                .theme-dark .admin-dashboard-lang,
                .theme-dark .admin-dashboard-alerts-toggle {
                    background: color-mix(in srgb, var(--surface-card-strong) 86%, transparent 14%);
                }
                .theme-dark .admin-dashboard-alerts-item,
                .theme-dark .admin-dashboard-alerts-empty,
                .theme-dark .admin-chart-placeholder {
                    background: color-mix(in srgb, var(--surface-card-strong) 72%, transparent 28%);
                }
                .theme-dark .tone-warning {
                    background: linear-gradient(180deg, rgba(245, 158, 11, 0.10), rgba(120, 53, 15, 0.14));
                }
                .theme-dark .tone-success {
                    background: linear-gradient(180deg, rgba(34, 197, 94, 0.10), rgba(20, 83, 45, 0.14));
                }
                .theme-dark .tone-info {
                    background: linear-gradient(180deg, rgba(56, 189, 248, 0.10), rgba(30, 64, 175, 0.14));
                }
                @media (max-width: 1280px) {
                    .admin-dashboard-metrics,
                    .admin-dashboard-bottom-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                    .admin-dashboard-top-grid,
                    .admin-dashboard-main-grid {
                        grid-template-columns: 1fr;
                    }
                }
                @media (max-width: 860px) {
                    .admin-dashboard-hero {
                        border-radius: 22px;
                        flex-direction: column;
                        padding: 1.4rem;
                    }
                    .admin-dashboard-controls {
                        width: 100%;
                        justify-content: stretch;
                        flex-wrap: wrap;
                    }
                    .admin-dashboard-search {
                        width: 100%;
                    }
                    .admin-dashboard-metrics,
                    .admin-dashboard-bottom-grid,
                    .admin-quick-actions,
                    .admin-patient-grid {
                        grid-template-columns: 1fr;
                    }
                    .admin-timeline-card {
                        grid-template-columns: 1fr;
                    }
                    .admin-timeline-title-row,
                    .admin-alert-card,
                    .admin-compact-item {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .admin-dashboard-shell {
                        gap: 1rem;
                    }
                }
                @media (max-width: 640px) {
                    .admin-dashboard-alerts-dropdown {
                        left: 0;
                        right: 0;
                        width: 100%;
                    }
                    .admin-panel {
                        padding: 1.05rem;
                        border-radius: 22px;
                    }
                    .admin-metric-card,
                    .admin-quick-action,
                    .admin-alert-card,
                    .admin-timeline-card,
                    .admin-patient-card {
                        padding: 0.95rem;
                    }
                }
            `}</style>
        </div>
    );
}

function StatusBadge({ label, payment = false }: { label: string; payment?: boolean }) {
    const tones: Record<string, { background: string; color: string }> = {
        BOOKED: { background: "rgba(37,99,235,0.12)", color: "#1D4ED8" },
        COMPLETED: { background: "rgba(21,128,61,0.12)", color: "#15803D" },
        CANCELLED: { background: "rgba(185,28,28,0.12)", color: "#B91C1C" },
        PAID: { background: "rgba(21,128,61,0.12)", color: "#15803D" },
        UNPAID: { background: "rgba(245,158,11,0.14)", color: "#B45309" }
    };

    const tone = tones[label] || (payment
        ? { background: "rgba(245,158,11,0.12)", color: "#B45309" }
        : { background: "rgba(15,76,129,0.12)", color: "#0F4C81" });

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 30,
                padding: "0 0.7rem",
                borderRadius: 999,
                background: tone.background,
                color: tone.color,
                fontSize: "0.76rem",
                fontWeight: 800,
                letterSpacing: "0.04em"
            }}
        >
            {label}
        </span>
    );
}
