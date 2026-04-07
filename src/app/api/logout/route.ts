import { NextRequest, NextResponse } from "next/server";
import { signOut } from "@/auth";
import { getSession } from "@/lib/auth";
import { blockSession } from "@/lib/session-blocklist";
import { createAuditLog, AuditAction } from "@/lib/audit";

export async function POST(request: NextRequest) {
    const session = await getSession();
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";

    if (session?.user?.id) {
        // Blocklist the current jti so the token can't be replayed after logout
        const jti = (session as unknown as { jti?: string }).jti;
        if (jti) {
            // Expire the blocklist entry after 24 hours (well past any reasonable session)
            await blockSession(jti, 24 * 60 * 60);
        }
        await createAuditLog(session.user.id, AuditAction.LOGOUT, "User logged out", ip);
    }

    await signOut({ redirect: false });
    return NextResponse.json({ success: true });
}
