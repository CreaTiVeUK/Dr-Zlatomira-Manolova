"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { format, isAfter, subHours } from "date-fns";
import { CalendarCheck2, CalendarClock, CalendarX2, Download, LockKeyhole, PencilLine } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import PageIntro from "@/components/PageIntro";
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
    };
  } | null;
}

export default function AppointmentsClient({ session }: AppointmentsClientProps) {
  const { dict, language } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleValue, setRescheduleValue] = useState("");
  const [rescheduleSaving, setRescheduleSaving] = useState(false);

  useEffect(() => {
    if (session) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [session]);

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
      setMessage(language === "bg" ? "Възникна грешка." : "An error occurred.");
    }
  }

  function openReschedule(appt: Appointment) {
    const d = new Date(appt.dateTime);
    const pad = (n: number) => String(n).padStart(2, "0");
    const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setRescheduleId(appt.id);
    setRescheduleValue(local);
    setMessage("");
  }

  async function handleReschedule(id: string, originalDateTime: string) {
    if (!rescheduleValue) return;
    const newDate = new Date(rescheduleValue);
    if (Number.isNaN(newDate.getTime()) || newDate.getTime() <= Date.now()) {
      setMessage(language === "bg" ? "Моля изберете бъдещ час." : "Please choose a future time.");
      return;
    }
    if (!isAfter(new Date(originalDateTime), subHours(new Date(), -24))) {
      setMessage(dict.myAppointments.cancelRestriction);
      return;
    }

    setRescheduleSaving(true);
    try {
      const res = await fetch(`/api/appointments?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateTime: newDate.toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || (language === "bg" ? "Промяната не беше записана." : "Reschedule failed."));
      } else {
        setMessage(language === "bg" ? "Часът е преместен успешно." : "Appointment rescheduled.");
        setRescheduleId(null);
        setRescheduleValue("");
        fetchAppointments();
      }
    } catch {
      setMessage(language === "bg" ? "Възникна грешка." : "An error occurred.");
    } finally {
      setRescheduleSaving(false);
    }
  }

  function handleDownload(appt: Appointment) {
    const ics = generateICS({
      id: appt.id,
      dateTime: new Date(appt.dateTime),
      duration: appt.duration,
      summary: "Pediatric Appointment: Dr. Manolova",
      description: `Session: ${appt.notes || "Clinical Consultation"}`,
    });

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "appointment.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    return {
      upcoming: appointments.filter((appt) => isAfter(new Date(appt.dateTime), now) && appt.status !== "CANCELLED"),
      past: appointments.filter((appt) => !isAfter(new Date(appt.dateTime), now) || appt.status === "CANCELLED"),
    };
  }, [appointments]);

  if (!session) {
    return (
      <div className="page-shell page-shell--soft">
        <div className="container state-shell">
          <div className="state-shell__panel">
            <EmptyState
              icon={LockKeyhole}
              title={dict.myAppointments.title}
              description={dict.myAppointments.loginRequired || "Please log in to view your appointments."}
              action={
                <button onClick={() => signIn(undefined, { callbackUrl: "/my-appointments" })} className="btn btn-primary" type="button">
                  {dict.auth.login.btn || "Log In"}
                </button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-shell page-shell--soft">
        <div className="container state-shell">
          <div className="state-shell__panel">
            <div className="spinner" aria-hidden="true" />
            <p>{language === "bg" ? "Зареждаме часовете Ви..." : "Loading your appointments..."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell page-shell--soft">
      <div className="container appointments-layout">
        <PageIntro
          eyebrow={dict.userMenu.appointments}
          title={dict.myAppointments.title}
          subtitle={language === "bg" ? "Следете предстоящите посещения, сваляйте календарни покани и управлявайте промените навреме." : "Track upcoming visits, download calendar invites, and manage changes before the appointment."}
          actions={
            <div className="btn-group" style={{ width: "100%" }}>
              <Link href="/book" className="btn btn-primary">
                {language === "bg" ? "Нов час" : "Book another visit"}
              </Link>
            </div>
          }
        />

        {message ? (
          <div className="status-banner status-banner--success">
            <strong>{message}</strong>
          </div>
        ) : null}

        <div className="appointments-summary">
          <div className="appointment-summary-card">
            <CalendarCheck2 size={18} color="var(--primary-teal)" />
            <strong>{upcoming.length}</strong>
            <span>{dict.myAppointments.upcoming}</span>
          </div>
          <div className="appointment-summary-card">
            <CalendarClock size={18} color="var(--primary-teal)" />
            <strong>{appointments.length}</strong>
            <span>{language === "bg" ? "общо посещения" : "total visits"}</span>
          </div>
          <div className="appointment-summary-card">
            <CalendarX2 size={18} color="var(--primary-teal)" />
            <strong>{past.filter((appt) => appt.status === "CANCELLED").length}</strong>
            <span>{dict.myAppointments.cancelled}</span>
          </div>
        </div>

        <section className="appointments-card">
          <div className="stack-md">
            <h2>{dict.myAppointments.upcoming}</h2>
            {upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title={dict.myAppointments.empthy}
                description={language === "bg" ? "След като запазите час, той ще се появи тук с опции за календар и отказ." : "Once you book, it will appear here with calendar and cancellation options."}
                compact
              />
            ) : (
              <div className="appointment-list">
                {upcoming.map((appt) => (
                  <article key={appt.id} className="appointment-entry">
                    <div className="appointment-entry__meta">
                      <strong>{format(new Date(appt.dateTime), "PPPP")}</strong>
                      <p>
                        {format(new Date(appt.dateTime), "p")} · {dict.myAppointments.confirmed}
                      </p>
                      {rescheduleId === appt.id ? (
                        <div className="form-grid" style={{ marginTop: "0.75rem", gap: "0.5rem" }}>
                          <input
                            type="datetime-local"
                            value={rescheduleValue}
                            onChange={(e) => setRescheduleValue(e.target.value)}
                            min={(() => { const d = new Date(Date.now() + 60 * 60000); const pad = (n: number) => String(n).padStart(2, "0"); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; })()}
                          />
                          <div className="btn-group">
                            <button type="button" className="btn btn-primary" disabled={rescheduleSaving} onClick={() => handleReschedule(appt.id, appt.dateTime)}>
                              {rescheduleSaving ? (language === "bg" ? "Запазване..." : "Saving...") : (language === "bg" ? "Потвърди" : "Confirm")}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => { setRescheduleId(null); setRescheduleValue(""); }}>
                              {language === "bg" ? "Откажи" : "Cancel"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div className="appointment-entry__actions">
                      <button onClick={() => handleDownload(appt)} className="btn btn-outline" type="button">
                        <Download size={16} />
                        {dict.myAppointments.download}
                      </button>
                      <button onClick={() => openReschedule(appt)} className="btn btn-outline" type="button">
                        <PencilLine size={16} />
                        {language === "bg" ? "Премести" : "Reschedule"}
                      </button>
                      <button onClick={() => handleCancel(appt.id, appt.dateTime)} className="btn btn-outline" type="button">
                        {dict.myAppointments.cancel}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="appointments-card">
          <div className="stack-md">
            <h2>{dict.myAppointments.past}</h2>
            {past.length === 0 ? (
              <EmptyState
                icon={CalendarCheck2}
                title={language === "bg" ? "Все още няма история." : "No history yet."}
                description={language === "bg" ? "Минали или отменени посещения ще се показват тук." : "Completed or cancelled visits will appear here."}
                compact
              />
            ) : (
              <div className="appointment-list">
                {past.map((appt) => (
                  <article key={appt.id} className="appointment-entry">
                    <div className="appointment-entry__meta">
                      <strong>{format(new Date(appt.dateTime), "PPPP")}</strong>
                      <p>{format(new Date(appt.dateTime), "p")}</p>
                    </div>
                    <div className="appointment-entry__actions">
                      <span className={`status-chip ${appt.status === "CANCELLED" ? "status-chip--error" : "status-chip--info"}`}>
                        {appt.status === "CANCELLED" ? dict.myAppointments.cancelled : "Completed"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
