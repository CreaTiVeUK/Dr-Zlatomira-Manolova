import { NextResponse } from "next/server";

export function GET() {
    const providers: string[] = [];
    if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) providers.push("google");
    if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) providers.push("facebook");
    if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) providers.push("apple");
    return NextResponse.json(providers);
}
