import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import {
    authorizeUser,
    jwtCallback,
    sessionCallback,
    signInCallback,
    type SessionShape,
    type TokenShape,
} from "@/lib/auth-callbacks";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/session-blocklist";

// All authorize/callback logic lives in src/lib/auth-callbacks.ts so it can be
// unit-tested with mocked dependencies; this file only assembles the config.

export const { handlers, auth, signIn, signOut } = NextAuth({
    // No adapter — we use JWT sessions exclusively. With a database adapter present,
    // NextAuth v5 beta attempts to persist Credentials logins as Account rows which
    // silently fails and returns null. OAuth user upsert is handled in the signIn callback.
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                totp: { label: "TOTP Code", type: "text" },
            },
            authorize: (credentials) => authorizeUser(credentials),
        }),
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Facebook({
            clientId: process.env.AUTH_FACEBOOK_ID,
            clientSecret: process.env.AUTH_FACEBOOK_SECRET,
        }),
        Apple({
            clientId: process.env.AUTH_APPLE_ID,
            clientSecret: process.env.AUTH_APPLE_SECRET,
        }),
    ],
    session: { strategy: "jwt", maxAge: SESSION_MAX_AGE_SECONDS },
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        signIn: ({ user, account, profile }) =>
            signInCallback({ user, account, profile: profile as { email?: string; name?: string; picture?: string } | null }),
        jwt: ({ token, user }) =>
            jwtCallback({ token: token as TokenShape, user }) as Promise<typeof token>,
        session: ({ session, token }) =>
            sessionCallback({ session: session as unknown as SessionShape, token: token as TokenShape }) as unknown as typeof session,
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return `${baseUrl}/auth/redirect`;
        },
    },
});
