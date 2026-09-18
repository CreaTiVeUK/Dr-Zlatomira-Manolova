/**
 * The practice's consultation schedule — the single source of truth read by
 * the server-side booking validator (booking.ts), the client slot grid
 * (BookClient.tsx) and, by hand, the footer copy and the JSON-LD in
 * layout.tsx. Keep those two in step when this changes.
 *
 * No Prisma import here on purpose: the booking client bundles this file.
 *
 * Confirmed by the owner 2026-09-09. Hours can vary — the footer says so —
 * but this is the schedule the booking engine offers.
 */

import { toZonedTime } from "date-fns-tz";

export const CLINIC_TIMEZONE = "Europe/Sofia";

export interface DayHours {
    /** First slot starts at this hour (clinic-local). */
    open: number;
    /** No slot may start at or after this hour; last slot is close − 0:30. */
    close: number;
}

/** Keyed by JavaScript weekday: 0 = Sunday … 6 = Saturday. Absent = closed. */
export const CLINIC_SCHEDULE: Readonly<Partial<Record<number, DayHours>>> = {
    2: { open: 14, close: 18 }, // Tuesday
    4: { open: 9, close: 18 },  // Thursday
    6: { open: 9, close: 14 },  // Saturday
};

export function hoursForDay(weekday: number): DayHours | null {
    return CLINIC_SCHEDULE[weekday] ?? null;
}

/**
 * Converts a UTC instant into a Date whose local-timezone getters (and thus
 * plain date-fns calls like isSameDay/startOfDay) read the clinic's
 * wall-clock values instead of the server process's timezone (UTC on
 * Vercel). Use this before any "is this today / this month" comparison
 * involving an appointment's dateTime — the server's own timezone is not
 * Europe/Sofia, so comparing raw Date instants misclassifies appointments
 * within a few hours of midnight.
 */
export function inClinicTz(date: Date): Date {
    return toZonedTime(date, CLINIC_TIMEZONE);
}
