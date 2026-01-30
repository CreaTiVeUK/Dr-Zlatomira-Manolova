
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const documents = await prisma.patientDocument.findMany({
            where: { userId: user.id },
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
        console.error("Documents fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
