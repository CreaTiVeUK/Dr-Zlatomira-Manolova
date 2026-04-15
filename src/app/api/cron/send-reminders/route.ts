/**
 * GET /api/cron/send-reminders
 *
 * Sends a reminder email for every BOOKED appointment starting in the
 * next 48 hours that hasn't been reminded yet. Vercel Hobby caps cron
 * frequency at once-per-day (with ±59 min precision), so we sweep a
 * full 48h horizon on each run and let `reminderSentAt` keep things
 * idempotent — every appointment gets exactly one reminder.
 *
 * Protected by CRON_SECRET (fail-closed).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, EMAIL_TEMPLATES } from "@/lib/email";
import { env, features } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    if (!env.CRON_SECRET) {
        console.error("[send-reminders] CRON_SECRET not set — refusing to run");
        return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!features.email) {
        return NextResponse.json({ error: "Email not configured" }, { status: 503 });
    }

    const now = new Date();
    const windowStart = now;
    const windowEnd = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    try {
        const appointments = await prisma.appointment.findMany({
            where: {
                status: "BOOKED",
                reminderSentAt: null,
                dateTime: { gte: windowStart, lte: windowEnd },
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });

        let sent = 0;
        let failed = 0;

        for (const appt of appointments) {
            if (!appt.user?.email) continue;

            const date = appt.dateTime.toLocaleDateString("en-GB");
            const time = appt.dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

            try {
                const result = await sendEmail(
                    appt.user.email,
                    EMAIL_TEMPLATES.REMINDER_24H(appt.user.name ?? appt.user.email, date, time)
                );

                if (result.success) {
                    await prisma.appointment.update({
                        where: { id: appt.id },
                        data: { reminderSentAt: new Date() },
                    });
                    sent++;
                } else {
                    console.warn(`[send-reminders] Failed for ${appt.id}:`, result.error);
                    failed++;
                }
            } catch (err) {
                console.error(`[send-reminders] Exception for ${appt.id}:`, err);
                failed++;
            }
        }

        return NextResponse.json({
            success: true,
            candidates: appointments.length,
            sent,
            failed,
            window: { start: windowStart.toISOString(), end: windowEnd.toISOString() },
        });
    } catch (error) {
        console.error("[send-reminders] Error:", error);
        return NextResponse.json({ error: "Reminder job failed" }, { status: 500 });
    }
}
