import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = "secret-key-change-me"; // In prod use env var
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
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
        const session = await encrypt({
            user: userData,
            expires,
            lastActivity: Date.now()
        });

        const cookieStore = await cookies();
        cookieStore.set("session", session, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
    } catch (e) {
        console.error("Error in login:", e);
        throw e;
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

import { auth as authjs } from "@/auth";

export async function getSession() {
    // 1. Try Auth.js session first (Social Login)
    // Only attempt if secret is present to avoid premature initialization crashes
    if (process.env.AUTH_SECRET) {
        try {
            const authjsSession = await authjs();
            if (authjsSession?.user) {
                return {
                    user: {
                        id: (authjsSession.user as any).id,
                        email: authjsSession.user.email,
                        name: authjsSession.user.name,
                        role: (authjsSession.user as any).role || "PATIENT",
                        image: authjsSession.user.image
                    }
                };
            }
        } catch (error: any) {
            // During static generation, Next.js throws a DYNAMIC_SERVER_USAGE error 
            // to signal that the route must be dynamic. We shouldn't log this as a "failure".
            if (error?.digest === 'DYNAMIC_SERVER_USAGE' || error?.message?.includes('Dynamic server usage')) {
                throw error; // Re-throw so Next.js can handle it correctly
            }
            console.error("Auth.js session check failed (likely config issue):", error);
        }
    }

    // 2. Fallback to Legacy JWT session (Credentials Login)
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    if (!session) return null;

    const parsed = await decrypt(session);
    if (!parsed) return null;

    // Inactivity Check for legacy session
    if (isSessionExpired(parsed.lastActivity)) {
        return null;
    }

    return parsed;
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return null;

    const parsed = await decrypt(session);
    if (!parsed) return null;

    // Check inactivity before refreshing
    if (isSessionExpired(parsed.lastActivity)) {
        return null;
    }

    // Update last activity
    parsed.lastActivity = Date.now();
    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: await encrypt(parsed),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    return res;
}
