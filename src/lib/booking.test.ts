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
    // 2026-06-15 is summer: Sofia = UTC+3. 2026-01-15 is winter: UTC+2.
    it("accepts 09:00 Sofia in summer (06:00Z)", () => {
        expect(isWithinBusinessHours(new Date("2026-06-15T06:00:00.000Z"))).toBe(true);
    });

    it("accepts 09:00 Sofia in winter (07:00Z)", () => {
        expect(isWithinBusinessHours(new Date("2026-01-15T07:00:00.000Z"))).toBe(true);
    });

    it("accepts the last slot of the day, 16:30 Sofia", () => {
        expect(isWithinBusinessHours(new Date("2026-06-15T13:30:00.000Z"))).toBe(true);
    });

    it("rejects starts before opening (08:30 Sofia)", () => {
        expect(isWithinBusinessHours(new Date("2026-06-15T05:30:00.000Z"))).toBe(false);
    });

    it("rejects starts at/after 17:00 Sofia", () => {
        expect(isWithinBusinessHours(new Date("2026-06-15T14:00:00.000Z"))).toBe(false);
    });

    it("rejects off-grid minutes (09:15)", () => {
        expect(isWithinBusinessHours(new Date("2026-06-15T06:15:00.000Z"))).toBe(false);
    });

    it("rejects non-zero seconds", () => {
        expect(isWithinBusinessHours(new Date("2026-06-15T06:00:30.000Z"))).toBe(false);
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
