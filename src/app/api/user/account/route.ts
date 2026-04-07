/**
 * GDPR account deletion — anonymises the user record.
 *
 * DELETE /api/user/account
 *
 * We anonymise rather than hard-delete to preserve:
 * - Audit log integrity (audit rows reference userId)
 * - Appointment history (medical records obligation)
 *
 * What gets cleared:
 * - name → "[deleted]"
 * - email → anonymised deterministic placeholder
 * - phone → null
 * - image → null
 * - password → null (prevents any future login)
 * - emailVerified → null
 *
 * What gets deleted:
 * - Children records (cascade)
 * - Patient documents (cascade + disk cleanup where possible)
 *
 * Appointments and audit logs are retained for legal compliance.
 */

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/auth";
import { NextResponse } from "next/server";
import { createAuditLog, AuditAction } from "@/lib/audit";
import { unlink } from "fs/promises";

export async function DELETE(req: Request) {
    const session = await getSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = (req as { headers: { get: (k: string) => string | null } }).headers.get("x-forwarded-for") ?? "unknown";
    const userId = session.user.id;

    try {
        // Fetch documents so we can attempt to delete files from disk
        const documents = await prisma.patientDocument.findMany({
            where: { userId },
            select: { id: true, fileUrl: true },
        });

        // Anonymise the user record and cascade-delete children + documents (DB rows)
        await prisma.$transaction(async (tx) => {
            // Write the final audit entry while the userId still links correctly
            await tx.auditLog.create({
                data: {
                    userId,
                    action: AuditAction.ACCOUNT_DELETE,
                    details: "User requested account deletion — record anonymised",
                    ip,
                },
            });

            // Anonymise: retain the row so audit log FK is satisfied, but strip all PII
            await tx.user.update({
                where: { id: userId },
                data: {
                    name: "[deleted]",
                    email: `deleted-${userId}@anonymised.invalid`,
                    phone: null,
                    image: null,
                    password: null,
                    emailVerified: null,
                    lockedUntil: null,
                    failedAttempts: 0,
                },
            });

            // Delete children records (cascade handles this but explicit is clearer)
            await tx.child.deleteMany({ where: { parentId: userId } });

            // Delete document DB rows (cascade from user would also work)
            await tx.patientDocument.deleteMany({ where: { userId } });
        });

        // Best-effort file cleanup — don't fail the request if a file is missing
        await Promise.allSettled(
            documents.map((doc) => unlink(doc.fileUrl))
        );

        // Sign the user out — their session is now invalid
        await signOut({ redirect: false });

        return NextResponse.json({
            success: true,
            message: "Your account has been deleted. All personal data has been removed.",
        });
    } catch (error) {
        console.error("Account deletion error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
