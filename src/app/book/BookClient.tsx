"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { addDays, endOfDay, format, startOfDay } from "date-fns";
import { CalendarDays, Clock3, LockKeyhole, ShieldCheck } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface BookClientProps {
  session: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  } | null;
}

export default function BookClient({ session }: BookClientProps) {
  const { dict, language } = useLanguage();
  const router = useRouter();

  const services = useMemo(
    () => [
      { name: dict.booking.services.standard, duration: 30, price: 25 },
      { name: dict.booking.services.specialized, duration: 60, price: 50 },
    ],
    [dict],
  );

  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [selectedService, setSelectedService] = useState(services[0]);
  const [slots, setSlots] = useState<Date[]>([]);
  const [bookedSlots, setBookedSlots] = useState<{ dateTime: string; duration: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tempSelectedSlot, setTempSelectedSlot] = useState<Date | null>(null);

  useEffect(() => {
    setSelectedService(services[0]);
  }, [services]);

  useEffect(() => {
    async function fetchData() {
      try {
        const start = startOfDay(new Date()).toISOString();
        const end = endOfDay(addDays(new Date(), 30)).toISOString();
        const res = await fetch(`/api/availability?start=${start}&end=${end}`);
        if (res.ok) {
          const data = await res.json();
          setBookedSlots(data.takenSlots);
        }
      } catch (err) {
        console.error("Error fetching availability:", err);
      }
    }

    if (session) {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    setTempSelectedSlot(null);
    const generatedSlots = [];

    for (let hour = 9; hour < 17; hour += 1) {
      const onTheHour = new Date(selectedDate);
      onTheHour.setHours(hour, 0, 0, 0);
      generatedSlots.push(onTheHour);

      const halfPast = new Date(selectedDate);
      halfPast.setHours(hour, 30, 0, 0);
      generatedSlots.push(halfPast);
    }

    setSlots(generatedSlots);
  }, [selectedDate]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

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
          notes: `Service: ${selectedService.name}`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = "/book/success";
      } else {
        setMessage(data.error || dict.booking.error);
      }
    } catch {
      setMessage(language === "bg" ? "Възникна грешка." : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const isSlotTaken = (slot: Date, duration: number) => {
    const slotTime = slot.getTime();
    const slotEnd = slotTime + duration * 60 * 1000;

    return bookedSlots.some((booked) => {
      const bookedStart = new Date(booked.dateTime).getTime();
      const bookedEnd = bookedStart + booked.duration * 60 * 1000;
      return slotTime < bookedEnd && slotEnd > bookedStart;
    });
  };

  if (!session) {
    return (
      <div className="page-shell page-shell--soft">
        <div className="container state-shell">
          <div className="state-shell__panel">
            <EmptyState
              icon={LockKeyhole}
              title={dict.booking.title}
              description={dict.booking.loginRequired || "Please log in to book an appointment."}
              action={
                <div className="btn-group" style={{ justifyContent: "center" }}>
                  <button onClick={() => signIn(undefined, { callbackUrl: "/book" })} className="btn btn-primary" type="button">
                    {dict.auth.login.btn || "Log In"}
                  </button>
                  <button onClick={() => router.push("/")} className="btn btn-outline" type="button">
                    {dict.header.nav.home || "Back to Home"}
                  </button>
                </div>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell page-shell--soft">
      <div className="container">
        <PageIntro
          eyebrow={dict.booking.title}
          title={dict.booking.title}
          subtitle={dict.booking.subtitle}
          actions={
            <div className="meta-grid" style={{ width: "100%" }}>
              <div className="meta-card">
                <CalendarDays size={18} color="var(--primary-teal)" />
                <strong>7</strong>
                <span>{language === "bg" ? "дни за избор" : "days ahead"}</span>
              </div>
              <div className="meta-card">
                <Clock3 size={18} color="var(--primary-teal)" />
                <strong>{selectedService.duration} min</strong>
                <span>{language === "bg" ? "продължителност" : "duration"}</span>
              </div>
              <div className="meta-card">
                <ShieldCheck size={18} color="var(--primary-teal)" />
                <strong>{selectedService.price} €</strong>
                <span>{language === "bg" ? "стандартна цена" : "standard fee"}</span>
              </div>
            </div>
          }
        />

        <div className="booking-card">
          <div className="booking-step">
            <div className="step-title">
              <h3>{dict.booking.step1}</h3>
            </div>
            <div className="choice-grid">
              {services.map((service) => {
                const isActive = selectedService.name === service.name;
                return (
                  <button
                    key={service.name}
                    onClick={() => {
                      setSelectedService(service);
                      setTempSelectedSlot(null);
                    }}
                    className={`choice-card${isActive ? " choice-card--active" : ""}`}
                    type="button"
                  >
                    <strong>{service.name}</strong>
                    <span>{service.duration} min</span>
                    <span style={{ color: "var(--primary-teal)", fontWeight: 700 }}>{service.price} €</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="booking-step">
            <div className="step-title">
              <h3>{dict.booking.step2}</h3>
            </div>
            <div className="date-strip">
              {days.map((day) => {
                const isActive = startOfDay(day).getTime() === selectedDate.getTime();
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(startOfDay(day))}
                    className={`date-pill${isActive ? " date-pill--active" : ""}`}
                    type="button"
                  >
                    <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.82rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {format(day, "EEE")}
                    </span>
                    <strong style={{ fontSize: "1.4rem" }}>{format(day, "d")}</strong>
                    <span>{format(day, "MMM")}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="booking-step">
            <div className="step-title">
              <h3>{dict.booking.step3}</h3>
            </div>

            {message ? (
              <div className="status-banner status-banner--warning">
                <strong>{message}</strong>
              </div>
            ) : null}

            <div className="slot-grid">
              {slots.map((slot) => {
                const isTaken = isSlotTaken(slot, selectedService.duration);
                const isSelected = tempSelectedSlot?.getTime() === slot.getTime();
                return (
                  <button
                    key={slot.toISOString()}
                    onClick={() => !isTaken && setTempSelectedSlot(slot)}
                    disabled={loading || isTaken}
                    className={`slot-button${isSelected ? " slot-button--selected" : ""}${isTaken ? " slot-button--taken" : ""}`}
                    type="button"
                  >
                    <span>{format(slot, "HH:mm")}</span>
                    {isTaken ? <span style={{ fontSize: "0.74rem" }}>{dict.booking.taken}</span> : null}
                  </button>
                );
              })}
            </div>

            {tempSelectedSlot ? (
              <div className="confirmation-card">
                <p>
                  {dict.booking.confirm.text
                    .replace("%s", selectedService.name)
                    .replace("%s", format(tempSelectedSlot, "PPP 'at' HH:mm"))}
                </p>
                <button onClick={() => handleBooking(tempSelectedSlot)} disabled={loading} className="btn btn-primary" type="button">
                  {loading ? dict.booking.confirm.loading : dict.booking.confirm.btn}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
