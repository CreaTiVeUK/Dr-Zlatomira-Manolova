/**
 * POST /api/account/2fa/setup
 *
 * Generates a fresh TOTP secret for the authenticated user and returns it
 * along with an otpauth:// URL for QR provisioning. The secret is stored
 * (encrypted) but TOTP is NOT enabled until the user confirms a code via
 * /api/account/2fa/verify.
 *
 * Admin accounts will be required to complete this flow at login once the
 * secret is verified; patients may opt in.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { buildOtpAuthUrl, generateSecret } from "@/lib/totp";
import { createAuditLog, AuditAction } from "@/lib/audit";

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, totpEnabledAt: true },
    });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (user.totpEnabledAt) {
        return NextResponse.json({ error: "2FA is already enabled. Disable it first to generate a new secret." }, { status: 400 });
    }

    const secret = generateSecret();
    await prisma.user.update({
        where: { id: session.user.id },
        data: { totpSecret: encrypt(secret) },
    });

    const otpauth = buildOtpAuthUrl({
        secret,
        accountName: user.email,
        issuer: "Dr. Manolova Clinic",
    });

    await createAuditLog(session.user.id, AuditAction.PROFILE_UPDATE, "Generated TOTP secret (pending verification)", ip).catch(() => {});

    return NextResponse.json({ secret, otpauth });
}
