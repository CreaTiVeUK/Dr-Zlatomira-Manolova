import { NextResponse } from "next/server";

/**
 * GET /api/available-providers — which OAuth buttons the login page shows.
 *
 * MUST NOT live at /api/auth/providers: that path belongs to NextAuth's
 * catch-all, and next-auth/react's signIn() reads it expecting an object
 * keyed by provider id. Shadowing it with this array made signIn() treat
 * EVERY provider (including "credentials") as unknown and bounce users back
 * to the login page — email/password login was completely broken.
 */
export function GET() {
    const providers: string[] = [];
    if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) providers.push("google");
    if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) providers.push("facebook");
    if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) providers.push("apple");
    return NextResponse.json(providers);
}
