
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";
import { createAuditLog, AuditAction } from "@/lib/audit";

export async function GET() {
    const session = await getSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                name: true,
                email: true,
                phone: true,
                image: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Decrypt PII before returning to client
        return NextResponse.json({
            ...user,
            phone: user.phone ? decrypt(user.phone) : null,
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = (req as { headers: { get: (k: string) => string | null } }).headers.get("x-forwarded-for") ?? "unknown";

    try {
        const body = await req.json();
        const { name, phone } = body;

        // Basic validation
        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const encryptedPhone = phone ? encrypt(phone) : undefined;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                phone: encryptedPhone,
            },
            select: {
                name: true,
                email: true,
                phone: true,
            },
        });

        await createAuditLog(session.user.id, AuditAction.PROFILE_UPDATE, "Profile updated (name/phone)", ip);

        // Decrypt before returning so the client sees the plaintext value
        return NextResponse.json({
            ...updatedUser,
            phone: updatedUser.phone ? decrypt(updatedUser.phone) : null,
        });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
