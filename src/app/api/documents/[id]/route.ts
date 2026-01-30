
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { stat } from "fs/promises";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

        // 3. Serve File
        // Check if file exists
        try {
            await stat(document.fileUrl);
        } catch {
            return NextResponse.json({ error: "File missing on server" }, { status: 404 });
        }

        const fileBuffer = await readFile(document.fileUrl);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": document.fileType,
                "Content-Disposition": `attachment; filename="${document.name}"`,
                "Content-Length": document.fileSize?.toString() || ""
            }
        });

    } catch (error) {
        console.error("Download error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
