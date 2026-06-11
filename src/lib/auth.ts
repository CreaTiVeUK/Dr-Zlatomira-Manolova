import { auth as authjs } from "@/auth";
import { isSessionBlocked, isUserRevoked } from "@/lib/session-blocklist";

interface Session {
    id: string;
    user: {
        id: string;
        email: string;
        role: string;
        name: string;
        image?: string | null;
    };
    expires: Date;
    lastActivity: number;
    /** JWT ID — handle for per-token revocation on logout. */
    jti?: string;
    /** Token issue time (ms) — compared against per-user revocation cutoffs. */
    issuedAt?: number;
}

export async function getSession(): Promise<Session | null> {
    try {
        const session = await authjs();
        if (!session?.user) return null;

        const flags = session as unknown as {
            invalidated?: string;
            jti?: string;
            issuedAt?: number;
        };

        // Inactivity-invalidated tokens are dead regardless of cookie validity.
        if (flags.invalidated) return null;

        const user = session.user as {
            id: string;
            email?: string | null;
            name?: string | null;
            role?: string | null;
            image?: string | null;
        };

        // Revocation checks (logout blocklist + all-devices revocation).
        // The proxy performs the same checks for page routes; doing it here too
        // covers API routes and keeps the guarantee even if the matcher misses.
        if (flags.jti && (await isSessionBlocked(flags.jti))) return null;
        if (user.id && flags.issuedAt && (await isUserRevoked(user.id, flags.issuedAt))) return null;

        return {
            id: user.id,
            user: {
                id: user.id,
                email: user.email ?? "",
                name: user.name ?? "",
                role: user.role ?? "PATIENT",
                image: user.image ?? null,
            },
            expires: new Date(session.expires),
            lastActivity: Date.now(),
            jti: flags.jti,
            issuedAt: flags.issuedAt,
        };
    } catch (error: unknown) {
        const err = error as { digest?: string; message?: string };
        // Re-throw dynamic server usage errors (e.g. called during static generation)
        if (
            err?.digest === "DYNAMIC_SERVER_USAGE" ||
            err?.message?.includes("Dynamic server usage")
        ) {
            throw error;
        }
        return null;
    }
}

// logout kept for /api/logout compatibility
export { signOut as logout } from "@/auth";
