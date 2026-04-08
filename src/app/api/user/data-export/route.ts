/**
 * GDPR data export — returns everything the system holds on the authenticated user.
 *
 * GET /api/user/data-export
 *
 * The response is a downloadable JSON file. Under GDPR Art. 20 (data portability)
 * users have the right to receive their personal data in a machine-readable format.
 */

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";
import { createAuditLog, AuditAction } from "@/lib/audit";

export async function GET(req: Request) {
    const session = await getSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = (req as { headers: { get: (k: string) => string | null } }).headers.get("x-forwarded-for") ?? "unknown";

    try {
        const userId = session.user.id;

        const [user, appointments, children, documents, auditLogs] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    image: true,
                    role: true,
                    createdAt: true,
                    emailVerified: true,
                },
            }),
            prisma.appointment.findMany({
                where: { userId },
                select: {
                    id: true,
                    dateTime: true,
                    duration: true,
                    price: true,
                    status: true,
                    paymentStatus: true,
                    notes: true,
                    createdAt: true,
                },
                orderBy: { dateTime: "asc" },
            }),
            prisma.child.findMany({
                where: { parentId: userId },
                select: {
                    id: true,
                    name: true,
                    birthDate: true,
                    gender: true,
                    notes: true,
                    createdAt: true,
                },
            }),
            prisma.patientDocument.findMany({
                where: { userId },
                select: {
                    id: true,
                    name: true,
                    fileType: true,
                    fileSize: true,
                    uploadedAt: true,
                    // Include transcription and summary — under GDPR Art. 15 users
                    // have the right to access all data held about them, including
                    // AI-processed content. fileUrl is omitted (internal server path).
                    transcription: true,
                    summary: true,
                },
            }),
            prisma.auditLog.findMany({
                where: { userId },
                select: {
                    action: true,
                    details: true,
                    timestamp: true,
                    ip: true,
                },
                orderBy: { timestamp: "desc" },
                take: 500, // cap to last 500 to keep response size reasonable
            }),
        ]);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Decrypt PII before exporting
        const exportPayload = {
            exportedAt: new Date().toISOString(),
            profile: {
                ...user,
                phone: user.phone ? decrypt(user.phone) : null,
            },
            appointments,
            children,
            documents,
            activityLog: auditLogs,
        };

        await createAuditLog(userId, AuditAction.DATA_EXPORT, "User requested GDPR data export", ip);

        const filename = `data-export-${userId}-${Date.now()}.json`;

        return new NextResponse(JSON.stringify(exportPayload, null, 2), {
            headers: {
                "Content-Type": "application/json",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Data export error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
