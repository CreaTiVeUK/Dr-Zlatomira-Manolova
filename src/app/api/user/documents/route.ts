
import { getSession } from "@/lib/auth";
import { isMissingTableError } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const documents = await prisma.patientDocument.findMany({
            where: { userId: session.user.id },
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
