
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/storage";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();

    // 1. Verify Admin Role
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    try {
        const { id: patientId } = await params;

        // 2. Parse Form Data
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // 3. Save to Disk
        const { filepath, size } = await saveFile(file, "patient-docs");

        // 4. Record in Database
        const document = await prisma.patientDocument.create({
            data: {
                name: file.name,
                fileUrl: filepath,     // Internal path
                fileType: file.type,
                fileSize: size,
                userId: patientId,     // Owner
                uploadedById: session.user.id! // Uploader
            }
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
