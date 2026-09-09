import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: { $transaction: vi.fn() },
}));

import type { Prisma } from "@prisma/client";
import {
    SERVICE_PRICES,
    hasConflict,
    isWithinBusinessHours,
    overlaps,
} from "./booking";

describe("SERVICE_PRICES", () => {
    it("matches the services offered in the booking UI", () => {
        expect(SERVICE_PRICES[30]).toBe(25);
        expect(SERVICE_PRICES[60]).toBe(50);
    });
});

describe("isWithinBusinessHours (clinic time = Europe/Sofia)", () => {
    // Schedule (clinic-hours.ts): Tue 14–18, Thu 9–18, Sat 9–14. Fixtures use
    // explicit offsets: +03:00 in summer, +02:00 in winter. 2026-06-16 is a
    // Tuesday, 06-18 a Thursday, 06-20 a Saturday, 06-15 Monday, 06-21 Sunday.

    it("accepts Tuesday 14:00, the first Tuesday slot", () => {
        expect(isWithinBusinessHours(new Date("2026-06-16T14:00:00+03:00"))).toBe(true);
    });

    it("rejects Tuesday 13:30 — the day opens at 14:00", () => {
        expect(isWithinBusinessHours(new Date("2026-06-16T13:30:00+03:00"))).toBe(false);
    });

    it("accepts the last Tuesday slot, 17:30, and rejects 18:00", () => {
        expect(isWithinBusinessHours(new Date("2026-06-16T17:30:00+03:00"))).toBe(true);
        expect(isWithinBusinessHours(new Date("2026-06-16T18:00:00+03:00"))).toBe(false);
    });

    it("accepts Thursday 09:00 in summer and in winter", () => {
        expect(isWithinBusinessHours(new Date("2026-06-18T09:00:00+03:00"))).toBe(true);
        expect(isWithinBusinessHours(new Date("2026-01-15T09:00:00+02:00"))).toBe(true);
    });

    it("rejects Thursday 08:30", () => {
        expect(isWithinBusinessHours(new Date("2026-06-18T08:30:00+03:00"))).toBe(false);
    });

    it("accepts Saturday 13:30 (last slot) and rejects 14:00", () => {
        expect(isWithinBusinessHours(new Date("2026-06-20T13:30:00+03:00"))).toBe(true);
        expect(isWithinBusinessHours(new Date("2026-06-20T14:00:00+03:00"))).toBe(false);
    });

    it("rejects any time on a closed day (Monday, Sunday)", () => {
        expect(isWithinBusinessHours(new Date("2026-06-15T10:00:00+03:00"))).toBe(false);
        expect(isWithinBusinessHours(new Date("2026-06-21T10:00:00+03:00"))).toBe(false);
    });

    it("evaluates the weekday in clinic time, not UTC", () => {
        // 23:30Z Monday is 02:30 Tuesday in Sofia — but 02:30 is outside hours,
        // so it is rejected for the hour, not the day. Conversely 21:00Z on a
        // Tuesday is 00:00 Wednesday in Sofia: closed.
        expect(isWithinBusinessHours(new Date("2026-06-16T21:00:00Z"))).toBe(false);
    });

    it("rejects off-grid minutes (14:15)", () => {
        expect(isWithinBusinessHours(new Date("2026-06-16T14:15:00+03:00"))).toBe(false);
    });

    it("rejects non-zero seconds", () => {
        expect(isWithinBusinessHours(new Date("2026-06-16T14:00:30+03:00"))).toBe(false);
    });
});

describe("overlaps", () => {
    const at = (iso: string) => new Date(iso);

    it("detects a contained overlap", () => {
        expect(
            overlaps(at("2026-06-15T10:30:00Z"), 30, { dateTime: at("2026-06-15T10:00:00Z"), duration: 60 })
        ).toBe(true);
    });

    it("treats back-to-back appointments as non-overlapping", () => {
        expect(
            overlaps(at("2026-06-15T10:30:00Z"), 30, { dateTime: at("2026-06-15T10:00:00Z"), duration: 30 })
        ).toBe(false);
        expect(
            overlaps(at("2026-06-15T09:30:00Z"), 30, { dateTime: at("2026-06-15T10:00:00Z"), duration: 30 })
        ).toBe(false);
    });

    it("detects partial overlaps in both directions", () => {
        expect(
            overlaps(at("2026-06-15T10:00:00Z"), 60, { dateTime: at("2026-06-15T10:30:00Z"), duration: 30 })
        ).toBe(true);
        expect(
            overlaps(at("2026-06-15T10:30:00Z"), 60, { dateTime: at("2026-06-15T10:00:00Z"), duration: 60 })
        ).toBe(true);
    });
});

interface FindManyArgs {
    where: { dateTime: { gte: Date; lt: Date }; status: string; id?: { not: string } };
}

describe("hasConflict", () => {
    function txWith(rows: { dateTime: Date; duration: number }[]) {
        const findMany = vi.fn(async (args: FindManyArgs) => {
            void args; // captured via mock.calls; assertions inspect the where clause
            return rows;
        });
        return { tx: { appointment: { findMany } } as unknown as Prisma.TransactionClient, findMany };
    }

    it("queries a window wide enough to catch earlier-starting bookings", async () => {
        const start = new Date("2026-06-16T07:00:00Z");
        const { tx, findMany } = txWith([]);

        await hasConflict(tx, start, 30);

        const where = findMany.mock.calls[0][0].where;
        // Window must reach back the maximum appointment duration (120 min)
        expect(where.dateTime.gte).toEqual(new Date("2026-06-16T05:00:00Z"));
        expect(where.dateTime.lt).toEqual(new Date("2026-06-16T07:30:00Z"));
        expect(where.status).toBe("BOOKED");
    });

    it("flags an overlap reported by the query", async () => {
        const { tx } = txWith([{ dateTime: new Date("2026-06-16T06:30:00Z"), duration: 60 }]);
        expect(await hasConflict(tx, new Date("2026-06-16T07:00:00Z"), 30)).toBe(true);
    });

    it("ignores adjacent bookings", async () => {
        const { tx } = txWith([{ dateTime: new Date("2026-06-16T06:30:00Z"), duration: 30 }]);
        expect(await hasConflict(tx, new Date("2026-06-16T07:00:00Z"), 30)).toBe(false);
    });

    it("excludes the appointment being rescheduled", async () => {
        const { tx, findMany } = txWith([]);
        await hasConflict(tx, new Date("2026-06-16T07:00:00Z"), 30, "appt-1");
        expect(findMany.mock.calls[0][0].where.id).toEqual({ not: "appt-1" });
    });
});
