import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt, updateSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    const { pathname } = request.nextUrl;
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    // Request Logging
    console.log(`[REQUEST] ${new Date().toISOString()} | IP: ${ip} | PATH: ${pathname} | METHOD: ${request.method}`);

    // Define protected routes
    const isProtectedRoute = pathname.startsWith('/book') || pathname.startsWith('/admin') || pathname.startsWith('/my-appointments');

    if (isProtectedRoute) {
        if (!session) {
            console.warn(`[AUTH_BLOCKED] Attempt to access ${pathname} from IP ${ip} without session.`);
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const parsed = await decrypt(session);
        if (!parsed) {
            console.warn(`[AUTH_INVALID] Malformed session cookie from IP ${ip}.`);
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Role-based protection
        if (pathname.startsWith('/admin') && parsed.user.role !== 'ADMIN') {
            console.warn(`[AUTH_FORBIDDEN] Role ${parsed.user.role} tried to access ADMIN area from IP ${ip}.`);
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    const response = await updateSession(request) || NextResponse.next();

    // Basic CORS Hardening for single domain
    response.headers.set('Access-Control-Allow-Origin', request.nextUrl.origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
}

export const config = {
    matcher: ['/book/:path*', '/admin/:path*', '/my-appointments/:path*'],
};
