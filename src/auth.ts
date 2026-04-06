import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeString } from "@/lib/sanitize";

const credentialsSchema = z.object({
    email: z.string().email().transform((v) => sanitizeString(v).toLowerCase()),
    password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = credentialsSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const { email, password } = parsed.data;

                const user = await prisma.user.findUnique({ where: { email } });
                if (!user || !user.password) return null;

                // Lockout check
                if (user.lockedUntil && user.lockedUntil > new Date()) return null;

                // Email verification required
                if (!user.emailVerified) return null;

                const valid = await bcrypt.compare(password, user.password);

                if (!valid) {
                    const attempts = user.failedAttempts + 1;
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            failedAttempts: attempts,
                            lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60_000) : null,
                        },
                    });
                    return null;
                }

                await prisma.user.update({
                    where: { id: user.id },
                    data: { failedAttempts: 0, lockedUntil: null, lastActivity: new Date() },
                });

                return { id: user.id, email: user.email, name: user.name, role: user.role };
            },
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
    session: { strategy: "jwt" },
    secret: process.env.AUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string }).role ?? "PATIENT";
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return `${baseUrl}/book`;
        },
    },
});
