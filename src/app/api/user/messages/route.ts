import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { AuditAction, createAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";

// Patients only talk to the clinic, never to each other. The "clinic inbox"
// is role-based: a patient's thread includes messages to/from ANY admin, so
// replies from a second admin account are never invisible. New messages are
// addressed to the oldest admin as the canonical inbox owner.
async function resolveAdminRecipient() {
    return prisma.user.findFirst({
        where: { role: "ADMIN" },
        orderBy: { createdAt: "asc" },
        select: { id: true },
    });
}

const sendSchema = z.object({
    content: z.string().min(1).max(2000).transform((v) => sanitizeString(v)),
});

export async function GET() {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { fromId: session.user.id, to: { role: "ADMIN" } },
                    { toId: session.user.id, from: { role: "ADMIN" } },
                ],
            },
            orderBy: { timestamp: "asc" },
            select: { id: true, content: true, timestamp: true, fromId: true, toId: true, readAt: true },
        });

        // Mark inbound messages read on fetch — patients don't get an unread view
        // of their own replies so there's no other place to clear the flag.
        await prisma.message.updateMany({
            where: { from: { role: "ADMIN" }, toId: session.user.id, readAt: null },
            data: { readAt: new Date() },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        logger.error("Patient messages GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = await rateLimit(`msg:send:${session.user.id}`, 30, 60_000);
    if (!limiter.success) {
        return NextResponse.json({ error: "Too many messages. Please wait a moment." }, { status: 429 });
    }

    try {
        const body = await req.json();
        const parsed = sendSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
        }

        const admin = await resolveAdminRecipient();
        if (!admin) {
            return NextResponse.json({ error: "Clinic inbox unavailable" }, { status: 503 });
        }

        const created = await prisma.message.create({
            data: { content: parsed.data.content, fromId: session.user.id, toId: admin.id },
            select: { id: true, content: true, timestamp: true, fromId: true, toId: true, readAt: true },
        });

        await createAuditLog(session.user.id, AuditAction.MESSAGE_SENT, `Patient sent message ${created.id} to clinic`, ip);

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        logger.error("Patient messages POST error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
