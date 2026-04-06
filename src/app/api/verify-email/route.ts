import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
        return NextResponse.json({ error: "Missing verification parameters." }, { status: 400 });
    }

    try {
        const record = await prisma.verificationToken.findUnique({
            where: { token },
        });

        if (!record || record.identifier !== email) {
            return NextResponse.json({ error: "Invalid verification link." }, { status: 400 });
        }

        if (record.expires < new Date()) {
            // Clean up expired token
            await prisma.verificationToken.delete({ where: { token } });
            return NextResponse.json({ error: "Verification link has expired. Please register again." }, { status: 410 });
        }

        // Mark user as verified and delete the token atomically
        await prisma.$transaction([
            prisma.user.update({
                where: { email },
                data: { emailVerified: new Date() },
            }),
            prisma.verificationToken.delete({ where: { token } }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Email verification error:", error);
        return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
    }
}
