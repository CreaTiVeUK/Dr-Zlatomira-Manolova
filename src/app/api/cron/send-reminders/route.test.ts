// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
    findMany: vi.fn(), updateMany: vi.fn(), sendEmail: vi.fn(),
    env: { CRON_SECRET: "cron-test-secret" as string | undefined },
    features: { email: true },
}));
vi.mock("@/lib/prisma", () => ({ prisma: { appointment: { findMany: mocks.findMany, updateMany: mocks.updateMany } } }));
vi.mock("@/lib/env", () => ({ env: mocks.env, features: mocks.features }));
vi.mock("@/lib/email", async (original) => ({ ...await original<typeof import("@/lib/email")>(), sendEmail: mocks.sendEmail }));
import { GET } from "./route";

const appointment = {
    id: "appointment-1", dateTime: new Date("2026-09-17T06:00:00Z"),
    user: { id: "patient-1", name: "Patient", email: "patient@example.test" },
};
function request(secret = "cron-test-secret") {
    return new NextRequest("http://localhost/api/cron/send-reminders", { headers: { authorization: `Bearer ${secret}` } });
}
beforeEach(() => {
    vi.clearAllMocks();
    mocks.env.CRON_SECRET = "cron-test-secret";
    mocks.features.email = true;
    mocks.findMany.mockResolvedValue([appointment]);
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.sendEmail.mockResolvedValue({ success: true });
});
describe("appointment reminder job", () => {
    it("fails closed without cron authorization or email configuration", async () => {
        expect((await GET(request("wrong"))).status).toBe(401);
        mocks.env.CRON_SECRET = undefined;
        expect((await GET(request())).status).toBe(503);
        mocks.env.CRON_SECRET = "cron-test-secret";
        mocks.features.email = false;
        expect((await GET(request())).status).toBe(503);
        expect(mocks.findMany).not.toHaveBeenCalled();
        expect(mocks.sendEmail).not.toHaveBeenCalled();
    });
    it("limits eligibility to future booked, unreminded appointments within 48 hours", async () => {
        const before = Date.now();
        const response = await GET(request());
        const { where } = mocks.findMany.mock.calls[0][0];
        expect(where).toMatchObject({ status: "BOOKED", reminderSentAt: null });
        expect(where.dateTime.gte.getTime()).toBeGreaterThanOrEqual(before);
        expect(where.dateTime.lte - where.dateTime.gte).toBe(48 * 60 * 60 * 1000);
        expect(response.status).toBe(200);
        expect(mocks.sendEmail.mock.calls[0][1].body).toContain("09:00");
        expect(mocks.updateMany).toHaveBeenCalledWith({
            where: { id: appointment.id, dateTime: appointment.dateTime, status: "BOOKED", reminderSentAt: null },
            data: { reminderSentAt: expect.any(Date) },
        });
    });
    it("uses the same provider key for overlapping runs, and a new key after rescheduling", async () => {
        await Promise.all([GET(request()), GET(request())]);
        const firstKey = mocks.sendEmail.mock.calls[0][2];
        expect(firstKey).toMatch(/^reminder\/[a-f0-9]{64}$/);
        expect(mocks.sendEmail.mock.calls[1][2]).toBe(firstKey);
        mocks.findMany.mockResolvedValue([{ ...appointment, dateTime: new Date("2026-09-17T07:00:00Z") }]);
        await GET(request());
        expect(mocks.sendEmail.mock.calls[2][2]).not.toBe(firstKey);
    });
    it("leaves failed deliveries pending and signals job failure for monitoring", async () => {
        mocks.sendEmail.mockResolvedValue({ success: false, error: "Provider unavailable" });
        const response = await GET(request());
        expect(response.status).toBe(503);
        expect(await response.json()).toMatchObject({ success: false, sent: 0, failed: 1 });
        expect(mocks.updateMany).not.toHaveBeenCalled();
    });
    it("reuses the key after delivery succeeds but recording it fails", async () => {
        mocks.updateMany.mockRejectedValueOnce(new Error("Database unavailable"));
        expect((await GET(request())).status).toBe(503);
        expect((await GET(request())).status).toBe(200);
        expect(mocks.sendEmail.mock.calls[0][2]).toBe(mocks.sendEmail.mock.calls[1][2]);
    });
});
