/**
 * GET /api/cron/purge-soft-deleted
 *
 * Hard-deletes PatientDocument rows (and their on-disk files) that have been
 * soft-deleted for longer than PURGE_AFTER_DAYS. Retains records within the
 * window to allow recovery and satisfy medical-retention windows.
 *
 * Protected by CRON_SECRET (fail-closed if the secret isn't configured).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteStoredFile } from "@/lib/storage";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

// 30 days — balances "recoverable" against storage/compliance cost
const PURGE_AFTER_DAYS = 30;

export async function GET(request: NextRequest) {
    // Fail-closed when the secret isn't configured
    if (!env.CRON_SECRET) {
        console.error("[purge-soft-deleted] CRON_SECRET not set — refusing to run");
        return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = new Date(Date.now() - PURGE_AFTER_DAYS * 24 * 60 * 60 * 1000);

    try {
        const candidates = await prisma.patientDocument.findMany({
            where: { deletedAt: { lt: cutoff } },
            select: { id: true, fileUrl: true, name: true },
        });

        let filesDeleted = 0;
        let rowsDeleted = 0;

        for (const doc of candidates) {
            // Best-effort file cleanup — deleteStoredFile validates the
            // location (blob URL or uploads dir) and tolerates missing files.
            try {
                await deleteStoredFile(doc.fileUrl);
                filesDeleted++;
            } catch (err) {
                console.error(`[purge-soft-deleted] Failed to delete ${doc.fileUrl}:`, err);
            }

            try {
                await prisma.patientDocument.delete({ where: { id: doc.id } });
                rowsDeleted++;
            } catch (err) {
                console.error(`[purge-soft-deleted] Failed to delete row ${doc.id}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            candidates: candidates.length,
            filesDeleted,
            rowsDeleted,
            cutoff: cutoff.toISOString(),
        });
    } catch (error) {
        console.error("[purge-soft-deleted] Error:", error);
        return NextResponse.json({ error: "Purge failed" }, { status: 500 });
    }
}
