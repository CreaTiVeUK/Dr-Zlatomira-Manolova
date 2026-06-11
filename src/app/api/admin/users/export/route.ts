/**
 * GET /api/admin/users/export
 *
 * Admin-only. Streams a CSV export of all patients with aggregate counts.
 * Each access is audit-logged.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tryDecrypt } from "@/lib/encryption";
import { AuditAction, createAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

function csvEscape(value: unknown): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export async function GET(req: Request) {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";

    const users = await prisma.user.findMany({
        where: { role: "PATIENT" },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            emailVerified: true,
            createdAt: true,
            lastActivity: true,
            _count: {
                select: {
                    children: true,
                    appointments: true,
                    documents: { where: { deletedAt: null } },
                },
            },
        },
    });

    const header = [
        "id",
        "name",
        "email",
        "phone",
        "email_verified",
        "created_at",
        "last_activity",
        "children_count",
        "appointments_count",
        "documents_count",
    ];

    const rows = users.map((u) => [
        u.id,
        u.name ?? "",
        u.email,
        // Phones are encrypted at rest — exporting ciphertext would hand the
        // doctor an unusable column
        u.phone ? tryDecrypt(u.phone) ?? "" : "",
        u.emailVerified ? "yes" : "no",
        u.createdAt.toISOString(),
        u.lastActivity ? u.lastActivity.toISOString() : "",
        u._count.children,
        u._count.appointments,
        u._count.documents,
    ]);

    // Prepend a UTF-8 BOM so Excel opens the file with the correct encoding.
    const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

    await createAuditLog(session.user.id, AuditAction.DATA_EXPORT, `Exported ${users.length} patient records (CSV)`, ip);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return new NextResponse(csv, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="patients-${timestamp}.csv"`,
            "Cache-Control": "no-store",
        },
    });
}
