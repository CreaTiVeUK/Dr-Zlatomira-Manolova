
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/sanitize";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuditLog, AuditAction } from "@/lib/audit";

const childSchema = z.object({
    name: z.string().min(1, "Name is required").max(100).transform((v) => sanitizeString(v)),
    birthDate: z
        .string()
        .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid birth date")
        .refine((v) => new Date(v) <= new Date(), "Birth date cannot be in the future")
        .refine((v) => new Date(v) >= new Date("1990-01-01"), "Birth date is unrealistically old"),
    gender: z.string().max(20).transform((v) => sanitizeString(v)).optional(),
    notes: z.string().max(2000).transform((v) => sanitizeString(v)).optional(),
});

export async function GET() {
    const session = await getSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const children = await prisma.child.findMany({
            where: { parentId: session.user.id },
            orderBy: { birthDate: 'desc' }
        });
        return NextResponse.json(children);
    } catch (error) {
        console.error("Children fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = (req as { headers: { get: (k: string) => string | null } }).headers.get("x-forwarded-for") ?? "unknown";

    try {
        const body = await req.json();
        const parsed = childSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues[0]?.message ?? "Invalid input" },
                { status: 400 }
            );
        }
        const { name, birthDate, gender, notes } = parsed.data;

        const child = await prisma.child.create({
            data: {
                name,
                birthDate: new Date(birthDate),
                gender,
                notes,
                parentId: session.user.id
            }
        });

        await createAuditLog(session.user.id, AuditAction.CHILD_CREATE, `Child record created: ${child.id}`, ip);

        return NextResponse.json(child);
    } catch (error) {
        console.error("Child creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getSession();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = (req as { headers: { get: (k: string) => string | null } }).headers.get("x-forwarded-for") ?? "unknown";

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Child ID is required" }, { status: 400 });
        }

        // Verify ownership
        const child = await prisma.child.findUnique({ where: { id } });
        if (!child || child.parentId !== session.user.id) {
            return NextResponse.json({ error: "Child not found or unauthorized" }, { status: 404 });
        }

        await prisma.child.delete({ where: { id } });

        await createAuditLog(session.user.id, AuditAction.CHILD_DELETE, `Child record deleted: ${id}`, ip);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Child deletion error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
