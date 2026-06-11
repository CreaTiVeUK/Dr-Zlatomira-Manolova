/**
 * POST /api/account/2fa/disable
 *
 * Requires the user's current password AND a valid TOTP (or backup) code.
 * Wipes the secret, enabledAt flag, and backup codes.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { verifyCodeWithCounter } from "@/lib/totp";
import { claimOnce } from "@/lib/session-blocklist";
import { createAuditLog, AuditAction } from "@/lib/audit";

const schema = z.object({
    password: z.string().min(1),
    code: z.string().trim(),
});

export async function POST(req: Request) {
    const session = await getSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { password: true, totpSecret: true, totpBackupCodes: true, totpEnabledAt: true },
    });
    if (!user?.totpEnabledAt || !user.totpSecret || !user.password) {
        return NextResponse.json({ error: "2FA is not enabled." }, { status: 400 });
    }

    const passwordOk = await bcrypt.compare(parsed.data.password, user.password);
    if (!passwordOk) {
        return NextResponse.json({ error: "Invalid password." }, { status: 400 });
    }

    let secret: string;
    try {
        secret = decrypt(user.totpSecret);
    } catch {
        // Secret is undecryptable anyway — password alone may not disable 2FA,
        // but a backup code still can (checked below).
        secret = "";
    }

    const counter = secret ? verifyCodeWithCounter(secret, parsed.data.code) : null;
    let ok = counter !== null && (await claimOnce(`totp:${session.user.id}:${counter}`, 120));

    // Fall back to a backup code
    if (!ok && user.totpBackupCodes) {
        try {
            const codes: string[] = JSON.parse(decrypt(user.totpBackupCodes));
            ok = codes.includes(parsed.data.code.toUpperCase());
        } catch {
            /* corrupt backup codes — treat as no match */
        }
    }

    if (!ok) {
        return NextResponse.json({ error: "Invalid code." }, { status: 400 });
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { totpSecret: null, totpEnabledAt: null, totpBackupCodes: null },
    });

    await createAuditLog(session.user.id, AuditAction.PROFILE_UPDATE, "Disabled TOTP 2FA", ip);

    return NextResponse.json({ success: true });
}
