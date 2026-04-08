/**
 * Cron: purge audit logs older than the retention period.
 *
 * Healthcare records in Bulgaria must be retained for a minimum of 5 years
 * (Ordinance № 49, SG 2010). We use 7 years to align with GDPR Art. 17(3)(b)
 * and medical record keeping best practice.
 *
 * Override via AUDIT_RETENTION_YEARS env var if regulations change.
 *
 * Schedule in vercel.json:  { "path": "/api/cron/purge-audit-logs", "schedule": "0 3 * * 0" }
 * (runs every Sunday at 03:00 UTC)
 *
 * Protected by CRON_SECRET — same pattern as the existing sync-reviews cron.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_RETENTION_YEARS = 7;

export async function GET(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return new Response("Cron secret not configured", { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    const retentionYears = parseInt(process.env.AUDIT_RETENTION_YEARS ?? "", 10);
    const years = Number.isFinite(retentionYears) && retentionYears >= 5
        ? retentionYears
        : DEFAULT_RETENTION_YEARS;

    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - years);

    try {
        const result = await prisma.auditLog.deleteMany({
            where: { timestamp: { lt: cutoff } },
        });

        console.log(`[cron/purge-audit-logs] Deleted ${result.count} records older than ${cutoff.toISOString()} (retention: ${years} years)`);

        return NextResponse.json({
            success: true,
            deleted: result.count,
            cutoff: cutoff.toISOString(),
            retentionYears: years,
        });
    } catch (error) {
        console.error("[cron/purge-audit-logs] Error:", error);
        return NextResponse.json({ error: "Failed to purge audit logs" }, { status: 500 });
    }
}
