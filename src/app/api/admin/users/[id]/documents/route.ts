import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveFile, FileValidationError } from "@/lib/storage";
import { createAuditLog, AuditAction } from "@/lib/audit";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    // Use getSession() — consistent with all other routes; respects inactivity
    // timeout and blocklist checks enforced by the proxy middleware.
    const session = await getSession();
    const ip = (req as { headers: { get: (k: string) => string | null } }).headers.get("x-forwarded-for") ?? "unknown";

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    try {
        const { id: patientId } = await params;

        // Validate patient exists before attempting write
        const patient = await prisma.user.findUnique({ where: { id: patientId }, select: { id: true } });
        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const { filepath, size } = await saveFile(file, "patient-docs");

        const document = await prisma.patientDocument.create({
            data: {
                name: file.name,
                fileUrl: filepath,
                fileType: file.type,
                fileSize: size,
                userId: patientId,
                uploadedById: session.user.id,
            },
        });

        await createAuditLog(
            session.user.id,
            AuditAction.DOCUMENT_UPLOAD,
            `Admin uploaded document "${file.name}" (${document.id}) for patient ${patientId}`,
            ip
        );

        return NextResponse.json(document);
    } catch (error) {
        if (error instanceof FileValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    const ip = (req as { headers: { get: (k: string) => string | null } }).headers.get("x-forwarded-for") ?? "unknown";

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    try {
        const { id: patientId } = await params;
        const { searchParams } = new URL(req.url);
        const docId = searchParams.get("docId");

        if (!docId) {
            return NextResponse.json({ error: "docId is required" }, { status: 400 });
        }

        const document = await prisma.patientDocument.findUnique({
            where: { id: docId },
            select: { id: true, userId: true, name: true },
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        if (document.userId !== patientId) {
            return NextResponse.json({ error: "Document does not belong to this patient" }, { status: 403 });
        }

        await prisma.patientDocument.delete({ where: { id: docId } });

        await createAuditLog(
            session.user.id,
            AuditAction.DOCUMENT_DELETE,
            `Admin deleted document "${document.name}" (${docId}) for patient ${patientId}`,
            ip
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete document error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
