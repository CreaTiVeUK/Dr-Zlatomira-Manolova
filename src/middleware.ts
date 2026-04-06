import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Routes that require any authenticated session
const PROTECTED = ["/my-appointments", "/profile", "/book"];
// Routes that require ADMIN role
const ADMIN = ["/admin"];

const key = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-secret-not-for-production-use"
);

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes

async function resolveSession(
  request: NextRequest
): Promise<{ authenticated: boolean; role: string }> {
  // ── 1. NextAuth JWT (OAuth / social login) ──────────────────────────────
  // NextAuth v5 uses __Secure-authjs.session-token in production,
  // authjs.session-token in development.
  const nextAuthCookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";
  const nextAuthToken = request.cookies.get(nextAuthCookieName)?.value;

  if (nextAuthToken) {
    try {
      const { payload } = await jwtVerify(nextAuthToken, key, {
        algorithms: ["HS256"],
      });
      const role =
        (payload as { role?: string; user?: { role?: string } }).role ||
        (payload as { role?: string; user?: { role?: string } }).user?.role ||
        "PATIENT";
      return { authenticated: true, role };
    } catch {
      // Token invalid or expired — fall through
    }
  }

  // ── 2. Legacy credential JWT (email/password login) ─────────────────────
  const legacyCookie = request.cookies.get("session")?.value;
  if (legacyCookie) {
    try {
      const { payload } = await jwtVerify(legacyCookie, key, {
        algorithms: ["HS256"],
      });
      const parsed = payload as {
        user?: { role?: string };
        lastActivity?: number;
      };
      if (
        parsed.user &&
        typeof parsed.lastActivity === "number" &&
        Date.now() - parsed.lastActivity <= INACTIVITY_MS
      ) {
        return { authenticated: true, role: parsed.user.role || "PATIENT" };
      }
    } catch {
      // Token invalid or expired
    }
  }

  return { authenticated: false, role: "" };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdmin = ADMIN.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (!isAdmin && !isProtected) return NextResponse.next();

  const { authenticated, role } = await resolveSession(request);

  if (!authenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/my-appointments/:path*",
    "/profile/:path*",
    "/book/:path*",
  ],
};
