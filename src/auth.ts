import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Facebook({
            clientId: process.env.AUTH_FACEBOOK_ID,
            clientSecret: process.env.AUTH_FACEBOOK_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Apple({
            clientId: process.env.AUTH_APPLE_ID,
            clientSecret: process.env.AUTH_APPLE_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
    ],
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (account) {
                console.log(`[AUTH_DEBUG] JWT callback: New login with provider ${account.provider}`);
            }
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.role = user.role || "PATIENT";
                console.log(`[AUTH_DEBUG] JWT callback: User attached to token. ID: ${token.id}, Role: ${token.role}`);
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                // @ts-ignore
                session.user.id = token.id as string;
                // @ts-ignore
                session.user.role = token.role as string;
                console.log(`[AUTH_DEBUG] Session callback: Session ready for User ID: ${session.user.id}, Role: ${session.user.role}`);
            } else {
                console.warn(`[AUTH_DEBUG] Session callback: Missing session.user or token.id`, { hasUser: !!session.user, hasTokenId: !!token.id });
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            console.log(`[AUTH_DEBUG] Redirect callback: url=${url}, baseUrl=${baseUrl}`);
            // Allows relative callback URLs
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            // Allows callback URLs on the same origin
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl + "/book"; // Default to book page
        },
    },
});
