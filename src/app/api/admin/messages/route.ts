import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { AuditAction, createAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";

async function requireAdmin() {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { session };
}

const sendSchema = z.object({
    patientId: z.string().uuid(),
    content: z.string().min(1).max(2000).transform((v) => sanitizeString(v)),
});

export async function GET(req: Request) {
    const gate = await requireAdmin();
    if ("error" in gate) return gate.error;

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    try {
        if (patientId) {
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { fromId: patientId, toId: gate.session.user.id },
                        { fromId: gate.session.user.id, toId: patientId },
                    ],
                },
                orderBy: { timestamp: "asc" },
                select: { id: true, content: true, timestamp: true, fromId: true, toId: true, readAt: true },
            });

            await prisma.message.updateMany({
                where: { fromId: patientId, toId: gate.session.user.id, readAt: null },
                data: { readAt: new Date() },
            });

            return NextResponse.json({ messages });
        }

        // List all patient threads with last message + unread count
        const adminId = gate.session.user.id;
        const latest = await prisma.message.findMany({
            where: { OR: [{ fromId: adminId }, { toId: adminId }] },
            orderBy: { timestamp: "desc" },
            select: { id: true, content: true, timestamp: true, fromId: true, toId: true, readAt: true },
        });

        // Reduce to per-patient latest + unread counter
        const threads = new Map<string, { patientId: string; lastMessage: string; lastAt: Date; unread: number }>();
        for (const m of latest) {
            const patientId = m.fromId === adminId ? m.toId : m.fromId;
            const existing = threads.get(patientId);
            if (!existing) {
                threads.set(patientId, {
                    patientId,
                    lastMessage: m.content,
                    lastAt: m.timestamp,
                    unread: m.fromId !== adminId && m.readAt === null ? 1 : 0,
                });
            } else if (m.fromId !== adminId && m.readAt === null) {
                existing.unread += 1;
            }
        }

        const patients = await prisma.user.findMany({
            where: { id: { in: Array.from(threads.keys()) } },
            select: { id: true, name: true, email: true },
        });
        const patientMap = new Map(patients.map((p) => [p.id, p]));

        const list = Array.from(threads.values())
            .map((t) => ({
                patientId: t.patientId,
                name: patientMap.get(t.patientId)?.name ?? "Unknown",
                email: patientMap.get(t.patientId)?.email ?? "",
                lastMessage: t.lastMessage,
                lastAt: t.lastAt,
                unread: t.unread,
            }))
            .sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());

        return NextResponse.json({ threads: list });
    } catch (error) {
        logger.error("Admin messages GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const gate = await requireAdmin();
    if ("error" in gate) return gate.error;

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = await rateLimit(`msg:admin:${gate.session.user.id}`, 60, 60_000);
    if (!limiter.success) {
        return NextResponse.json({ error: "Too many messages. Please wait a moment." }, { status: 429 });
    }

    try {
        const body = await req.json();
        const parsed = sendSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
        }

        const patient = await prisma.user.findUnique({
            where: { id: parsed.data.patientId },
            select: { id: true, role: true },
        });
        if (!patient || patient.role !== "PATIENT") {
            return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
        }

        const created = await prisma.message.create({
            data: { content: parsed.data.content, fromId: gate.session.user.id, toId: patient.id },
            select: { id: true, content: true, timestamp: true, fromId: true, toId: true, readAt: true },
        });

        await createAuditLog(gate.session.user.id, AuditAction.MESSAGE_SENT, `Admin replied to patient ${patient.id} (message ${created.id})`, ip);

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        logger.error("Admin messages POST error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
