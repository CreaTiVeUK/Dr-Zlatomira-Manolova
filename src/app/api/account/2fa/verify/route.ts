/**
 * POST /api/account/2fa/verify
 *
 * Confirms a TOTP setup by checking a user-supplied code against the
 * pending secret. On success, enables 2FA (sets totpEnabledAt) and mints
 * 10 single-use backup recovery codes — returned once, then stored
 * encrypted. The plaintext codes are never retrievable afterwards.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/encryption";
import { generateBackupCodes, verifyCodeWithCounter } from "@/lib/totp";
import { claimOnce } from "@/lib/session-blocklist";
import { createAuditLog, AuditAction } from "@/lib/audit";

const schema = z.object({
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
        select: { totpSecret: true, totpEnabledAt: true },
    });
    if (!user?.totpSecret) {
        return NextResponse.json({ error: "No pending TOTP setup. Run /setup first." }, { status: 400 });
    }
    if (user.totpEnabledAt) {
        return NextResponse.json({ error: "2FA is already enabled." }, { status: 400 });
    }

    let secret: string;
    try {
        secret = decrypt(user.totpSecret);
    } catch {
        return NextResponse.json({ error: "TOTP setup is corrupted. Run /setup again." }, { status: 400 });
    }

    const counter = verifyCodeWithCounter(secret, parsed.data.code);
    if (counter === null) {
        return NextResponse.json({ error: "Invalid code. Try again." }, { status: 400 });
    }
    // Single-use: the setup code cannot be replayed (e.g. as the first login)
    if (!(await claimOnce(`totp:${session.user.id}:${counter}`, 120))) {
        return NextResponse.json({ error: "Code already used. Wait for the next one." }, { status: 400 });
    }

    const backupCodes = generateBackupCodes(10);

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            totpEnabledAt: new Date(),
            totpBackupCodes: encrypt(JSON.stringify(backupCodes)),
        },
    });

    await createAuditLog(session.user.id, AuditAction.PROFILE_UPDATE, "Enabled TOTP 2FA", ip);

    // Backup codes are shown ONCE. The UI must instruct the user to save them.
    return NextResponse.json({ success: true, backupCodes });
}
