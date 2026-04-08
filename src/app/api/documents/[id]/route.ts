import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { readEncryptedFile } from "@/lib/storage";
import { createAuditLog, AuditAction } from "@/lib/audit";
import { stat } from "fs/promises";
import { resolve } from "path";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    // Use getSession() — consistent with all other routes; respects inactivity
    // timeout and blocklist checks enforced by the proxy middleware.
    const session = await getSession();

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = (req as { headers: { get: (k: string) => string | null } }).headers.get("x-forwarded-for") ?? "unknown";

    try {
        const { id } = await params;

        const document = await prisma.patientDocument.findUnique({ where: { id } });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // User must own the doc OR be Admin
        const isOwner = document.userId === session.user.id;
        const isAdmin = session.user.role === "ADMIN";

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Path traversal guard — file must be inside the uploads directory
        const uploadsDir = resolve(process.cwd(), "uploads");
        const resolvedPath = resolve(document.fileUrl);
        if (!resolvedPath.startsWith(uploadsDir + "/") && resolvedPath !== uploadsDir) {
            return NextResponse.json({ error: "Invalid file path" }, { status: 403 });
        }

        await createAuditLog(
            session.user.id,
            AuditAction.DOCUMENT_DOWNLOAD,
            `Document ${id} (${document.name}) downloaded`,
            ip
        );

        try {
            await stat(resolvedPath);
        } catch {
            return NextResponse.json({ error: "File missing on server" }, { status: 404 });
        }

        // readEncryptedFile transparently decrypts files saved with saveEncryptedFile,
        // and returns unencrypted files as-is (backward compat).
        const fileBuffer = await readEncryptedFile(resolvedPath);

        // Sanitise filename — only safe characters to prevent header injection
        const safeFilename = document.name.replace(/[^\w.\-]/g, "_");

        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                "Content-Type": document.fileType,
                "Content-Disposition": `attachment; filename="${safeFilename}"`,
                "Content-Length": fileBuffer.length.toString(),
                "X-Content-Type-Options": "nosniff",
            },
        });
    } catch (error) {
        console.error("Download error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
