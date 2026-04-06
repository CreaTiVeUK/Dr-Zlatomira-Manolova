import { auth as authjs } from "@/auth";

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
}

export async function getSession(): Promise<Session | null> {
    try {
        const session = await authjs();
        if (!session?.user) return null;

        const user = session.user as {
            id: string;
            email?: string | null;
            name?: string | null;
            role?: string | null;
            image?: string | null;
        };

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

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

/** Returns true if the session has been idle longer than INACTIVITY_LIMIT. */
export function isSessionExpired(lastActivity: number): boolean {
    return Date.now() - lastActivity > INACTIVITY_LIMIT;
}
