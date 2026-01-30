
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
            where: { email: session.user.email },
            include: { children: { orderBy: { birthDate: 'desc' } } }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.children);
    } catch (error) {
        console.error("Children fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, birthDate, gender, notes } = body;

        if (!name || !birthDate) {
            return NextResponse.json({ error: "Name and Birth Date are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const child = await prisma.child.create({
            data: {
                name,
                birthDate: new Date(birthDate),
                gender,
                notes,
                parentId: user.id
            }
        });

        return NextResponse.json(child);
    } catch (error) {
        console.error("Child creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await auth();

    if (!session || !session.user || !session.user.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Child ID is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Verify ownership
        const child = await prisma.child.findUnique({ where: { id } });
        if (!child || child.parentId !== user.id) {
            return NextResponse.json({ error: "Child not found or unauthorized" }, { status: 404 });
        }

        await prisma.child.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Child deletion error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
