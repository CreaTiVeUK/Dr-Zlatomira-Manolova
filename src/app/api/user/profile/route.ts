
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, tryDecrypt } from "@/lib/encryption";
import { sanitizeString } from "@/lib/sanitize";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuditLog, AuditAction } from "@/lib/audit";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100).transform((v) => sanitizeString(v)),
    // null clears the stored phone; undefined leaves it unchanged
    phone: z.string().max(30).transform((v) => sanitizeString(v)).nullable().optional(),
});

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
            phone: user.phone ? tryDecrypt(user.phone) : null,
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
        const parsed = profileSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 }
            );
        }

        const { name, phone } = parsed.data;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name,
                // undefined = keep, null = clear, string = encrypt and store
                phone: phone === undefined ? undefined : phone === null || phone === "" ? null : encrypt(phone),
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
            phone: updatedUser.phone ? tryDecrypt(updatedUser.phone) : null,
        });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
