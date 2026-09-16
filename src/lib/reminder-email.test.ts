// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
const send = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({ Resend: class { emails = { send }; } }));
import { EMAIL_TEMPLATES, sendEmail } from "./email";
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
describe("reminder email", () => {
    it.each([
        ["2026-07-02T06:00:00Z", "09:00"],
        ["2026-01-08T07:00:00Z", "09:00"],
        ["2026-07-01T22:00:00Z", "01:00"],
    ])("uses Sofia time including daylight saving: %s", (date, time) => {
        vi.stubEnv("APP_URL", "https://www.drmanolova.bg");
        const template = EMAIL_TEMPLATES.APPOINTMENT_REMINDER(new Date(date));
        expect(template.body).toContain(`Час: ${time}`);
        expect(template.body).toContain(`Time: ${time}`);
        expect(template.body).toContain("https://www.drmanolova.bg/my-appointments");
        expect(template.body).not.toContain("tomorrow");
        if (time === "01:00") expect(template.body).toContain("02.07.2026");
    });
    it("passes the idempotency key to Resend", async () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("RESEND_API_KEY", "test-key");
        send.mockResolvedValue({ data: { id: "email-1" }, error: null });
        const template = { subject: "Reminder", body: "Appointment" };
        expect(await sendEmail("patient@example.test", template, "reminder/test")).toMatchObject({ success: true });
        expect(send).toHaveBeenCalledWith(expect.objectContaining({ text: "Appointment" }), { idempotencyKey: "reminder/test" });
    });
});
