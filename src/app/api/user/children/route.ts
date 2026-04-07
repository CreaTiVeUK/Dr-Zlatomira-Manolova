
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createAuditLog, AuditAction } from "@/lib/audit";

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
        const { name, birthDate, gender, notes } = body;

        if (!name || !birthDate) {
            return NextResponse.json({ error: "Name and Birth Date are required" }, { status: 400 });
        }

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
