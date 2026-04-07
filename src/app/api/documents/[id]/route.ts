
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { stat } from "fs/promises";
import { resolve } from "path";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = (req as { headers: { get: (k: string) => string | null } }).headers.get("x-forwarded-for") ?? "unknown";

    try {
        const { id } = await params;

        // 1. Get Document Record
        const document = await prisma.patientDocument.findUnique({
            where: { id }
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // 2. Security Check: User must own the doc OR be Admin
        const isOwner = document.userId === session.user.id;
        const isAdmin = session.user.role === "ADMIN";

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 3. Path traversal guard — file must be inside the uploads directory
        const uploadsDir = resolve(process.cwd(), "uploads");
        const resolvedPath = resolve(document.fileUrl);
        if (!resolvedPath.startsWith(uploadsDir + "/") && resolvedPath !== uploadsDir) {
            return NextResponse.json({ error: "Invalid file path" }, { status: 403 });
        }

        // 4. Audit log — every download is recorded
        await prisma.auditLog.create({
            data: {
                userId: session.user.id!,
                action: "DOCUMENT_DOWNLOAD",
                details: `Document ${id} (${document.name}) downloaded`,
                ip,
            }
        });

        // 5. Serve File
        try {
            await stat(resolvedPath);
        } catch {
            return NextResponse.json({ error: "File missing on server" }, { status: 404 });
        }

        const fileBuffer = await readFile(resolvedPath);

        // Sanitise filename: only allow safe characters to prevent header injection
        const safeFilename = document.name.replace(/[^\w.\-]/g, "_");

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": document.fileType,
                "Content-Disposition": `attachment; filename="${safeFilename}"`,
                "Content-Length": document.fileSize?.toString() || "",
                "X-Content-Type-Options": "nosniff",
            }
        });

    } catch (error) {
        console.error("Download error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
