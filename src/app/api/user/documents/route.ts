
import { getSession } from "@/lib/auth";
import { isMissingTableError } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import { saveFile, FileValidationError } from "@/lib/storage";
import { AuditAction, createAuditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const documents = await prisma.patientDocument.findMany({
            where: { userId: session.user.id, deletedAt: null },
            orderBy: { uploadedAt: 'desc' },
            select: {
                id: true,
                name: true,
                uploadedAt: true,
                fileSize: true,
                fileType: true
            }
        });

        return NextResponse.json(documents);
    } catch (error) {
        if (isMissingTableError(error)) {
            return NextResponse.json([]);
        }
        console.error("Documents fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Patient-facing self-upload. Type and size are validated in saveFile().
// A rate limit protects the disk/quota against malicious uploads — 10/hour
// per user is generous for a human patient but blocks automated abuse.
export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = await rateLimit(`docs:upload:${session.user.id}`, 10, 60 * 60_000);
    if (!limiter.success) {
        return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
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
                userId: session.user.id,
                uploadedById: session.user.id,
            },
            select: { id: true, name: true, uploadedAt: true, fileSize: true, fileType: true },
        });

        await createAuditLog(
            session.user.id,
            AuditAction.DOCUMENT_UPLOAD,
            `Patient uploaded document "${file.name}" (${document.id})`,
            ip,
        );

        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        if (error instanceof FileValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        console.error("Patient upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Patients may delete their own documents (soft-delete, like the admin path).
// Used for accidental uploads; the 30-day purge cron handles hard removal.
export async function DELETE(req: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { searchParams } = new URL(req.url);
    const docId = searchParams.get("id");
    if (!docId) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    try {
        const document = await prisma.patientDocument.findFirst({
            where: { id: docId, userId: session.user.id, deletedAt: null },
            select: { id: true, name: true },
        });
        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        await prisma.patientDocument.update({
            where: { id: docId },
            data: { deletedAt: new Date() },
        });

        await createAuditLog(
            session.user.id,
            AuditAction.DOCUMENT_DELETE,
            `Patient soft-deleted document "${document.name}" (${docId})`,
            ip,
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Patient delete document error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
