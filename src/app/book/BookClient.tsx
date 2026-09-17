"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { addDays, endOfDay, format, startOfDay } from "date-fns";
import { LockKeyhole } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import StatusBanner from "@/components/StatusBanner";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { hoursForDay } from "@/lib/clinic-hours";

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
      { name: dict.booking.services.visit, duration: 15, price: 35 },
    ],
    [dict],
  );

  // Open on the next consultation day rather than "today", which is closed
  // four days out of seven.
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    for (let i = 0; i < 7; i++) {
      const day = startOfDay(addDays(new Date(), i));
      if (hoursForDay(day.getDay())) return day;
    }
    return startOfDay(new Date());
  });
  const [selectedService, setSelectedService] = useState(services[0]);
  const [bookedSlots, setBookedSlots] = useState<{ dateTime: string; duration: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [tempSelectedSlot, setTempSelectedSlot] = useState<Date | null>(null);

  // services is recreated (new translated names) whenever the language
  // toggles — reset the selection during render rather than in an effect;
  // the guard is self-terminating since it compares against the tracked
  // previous array.
  const [prevServices, setPrevServices] = useState(services);
  if (services !== prevServices) {
    setPrevServices(services);
    setSelectedService(services[0]);
  }

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

  // Selecting a new date/service invalidates any temporarily-held slot —
  // reset it during render (self-terminating: the guard tracks the exact
  // key being compared), then let the effect below regenerate the slot list.
  const slotsKey = `${selectedDate.getTime()}-${selectedService.duration}`;
  const [prevSlotsKey, setPrevSlotsKey] = useState(slotsKey);
  if (slotsKey !== prevSlotsKey) {
    setPrevSlotsKey(slotsKey);
    setTempSelectedSlot(null);
  }

  const slots = useMemo(() => {
    const generatedSlots: Date[] = [];
    const hours = hoursForDay(selectedDate.getDay());
    if (!hours) return generatedSlots;

    for (let hour = hours.open; hour < hours.close; hour += 1) {
      for (const minute of [0, 15, 30, 45]) {
        if (hour * 60 + minute + selectedService.duration > hours.close * 60) continue;
        const slot = new Date(selectedDate);
        slot.setHours(hour, minute, 0, 0);
        generatedSlots.push(slot);
      }
    }

    return generatedSlots;
  }, [selectedDate, selectedService.duration]);

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
          // price is display-only — the server derives it from the duration
          notes: `Service: ${selectedService.name}`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/book/success");
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
        <h1 className="sr-only">{dict.booking.title}</h1>

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
            <p className="text-muted" style={{ marginTop: "0.75rem", fontSize: "0.92rem" }}>
              {dict.booking.followUpNote}
            </p>
          </div>

          <div className="booking-step">
            <div className="step-title">
              <h3>{dict.booking.step2}</h3>
            </div>
            <div className="date-strip">
              {days.map((day) => {
                const isActive = startOfDay(day).getTime() === selectedDate.getTime();
                const isClosed = !hoursForDay(day.getDay());
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(startOfDay(day))}
                    className={`date-pill${isActive ? " date-pill--active" : ""}`}
                    style={isClosed ? { opacity: 0.4 } : undefined}
                    aria-disabled={isClosed}
                    disabled={isClosed}
                    title={isClosed ? dict.booking.closedDay : undefined}
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
              // Result of the booking attempt the user just made — focus it.
              <StatusBanner variant="warning" focus>
                <strong>{message}</strong>
              </StatusBanner>
            ) : null}

            {slots.length === 0 ? (
              // Appears passively as the user browses dates — never steal
              // focus off the date strip mid-browse; the live region still
              // announces it.
              <StatusBanner variant="warning">
                <strong>{dict.booking.closedDay}</strong>
              </StatusBanner>
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
