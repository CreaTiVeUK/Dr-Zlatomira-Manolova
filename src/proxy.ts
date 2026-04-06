import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/auth";

const PROTECTED_ROUTES = ["/book", "/my-appointments", "/profile", "/admin"];

// Routes that require authentication. Unauthenticated requests are redirected to /login.
// Role-based checks (ADMIN vs PATIENT) remain in server-side route handlers.
function isAuthenticated(request: NextRequest): boolean {
    // Custom credential session (email/password login)
    if (request.cookies.get("session")?.value) return true;
    // Auth.js OAuth session (name differs between dev and prod)
    if (request.cookies.get("next-auth.session-token")?.value) return true;
    if (request.cookies.get("__Secure-next-auth.session-token")?.value) return true;
    return false;
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Enforce authentication on protected routes
    const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
    if (isProtected && !isAuthenticated(request)) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Refresh session expiry on every request (custom JWT session only)
    return await updateSession(request);
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
