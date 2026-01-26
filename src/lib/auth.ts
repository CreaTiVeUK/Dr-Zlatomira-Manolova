import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = "secret-key-change-me"; // In prod use env var
const key = new TextEncoder().encode(secretKey);

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

export async function encrypt(payload: Record<string, unknown>) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function decrypt(input: string): Promise<Record<string, unknown> | null> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload as Record<string, unknown>;
    } catch (error: unknown) {
        console.error("JWT Decrypt error:", error);
        return null;
    }
}

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes

export function isSessionExpired(lastActivity: number) {
    return Date.now() - lastActivity > INACTIVITY_LIMIT;
}

export async function login(userData: { id: string; email: string; role: string; name: string }) {
    try {
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const sessionPayload: Record<string, unknown> = {
            user: userData,
            expires: expires.toISOString(),
            lastActivity: Date.now()
        };
        const session = await encrypt(sessionPayload);

        const cookieStore = await cookies();
        cookieStore.set("session", session, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
    } catch (e: unknown) {
        console.error("Error in login:", e);
        throw e;
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

import { auth as authjs } from "@/auth";

export async function getSession(): Promise<Session | null> {
    // 1. Try Auth.js session first (Social Login)
    if (process.env.AUTH_SECRET) {
        try {
            const authjsSession = await authjs();
            if (authjsSession?.user) {
                const user = authjsSession.user as { id: string; email?: string | null; name?: string | null; role?: string | null; image?: string | null };
                return {
                    id: user.id,
                    user: {
                        id: user.id,
                        email: user.email || "",
                        name: user.name || "",
                        role: user.role || "PATIENT",
                        image: user.image || null
                    },
                    expires: new Date(authjsSession.expires),
                    lastActivity: Date.now()
                };
            }
        } catch (error: unknown) {
            const err = error as { digest?: string; message?: string };
            if (err?.digest === 'DYNAMIC_SERVER_USAGE' || err?.message?.includes('Dynamic server usage')) {
                throw error;
            }
            console.error("Auth.js session check failed:", error);
        }
    }

    // 2. Fallback to Legacy JWT session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) return null;

    const parsedRaw = await decrypt(sessionCookie);
    if (!parsedRaw) return null;

    // Type casting with safety
    const parsed = parsedRaw as unknown as Session;
    if (!parsed.user || typeof parsed.lastActivity !== 'number') return null;

    if (isSessionExpired(parsed.lastActivity)) {
        return null;
    }

    return parsed;
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return null;

    const parsedRaw = await decrypt(session);
    if (!parsedRaw) return null;

    const parsed = parsedRaw as unknown as Session;
    if (isSessionExpired(parsed.lastActivity)) {
        return null;
    }

    parsed.lastActivity = Date.now();
    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: await encrypt(parsed as unknown as Record<string, unknown>),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return res;
}
