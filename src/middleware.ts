import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { randomBytes } from "crypto";

// Routes that require any authenticated session
const PROTECTED = ["/my-appointments", "/profile", "/book"];
// Routes that require ADMIN role
const ADMIN = ["/admin"];

const key = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-only-secret-not-for-production-use"
);

const INACTIVITY_MS = 30 * 60 * 1000;

async function resolveSession(
  request: NextRequest
): Promise<{ authenticated: boolean; role: string }> {
  // ── 1. NextAuth JWT ───────────────────────────────────────────────────────
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
      // fall through
    }
  }

  // ── 2. Legacy credential cookie (still present until user re-logs in) ────
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
      // expired or invalid
    }
  }

  return { authenticated: false, role: "" };
}

function buildCSP(nonce: string): string {
  const directives = [
    "default-src 'self'",
    // nonce replaces unsafe-inline + unsafe-eval for scripts
    `script-src 'self' 'nonce-${nonce}' https://accounts.google.com https://connect.facebook.net https://appleid.apple.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self'",
    "connect-src 'self' https://accounts.google.com https://www.facebook.com https://appleid.apple.com",
    "frame-src https://accounts.google.com https://www.facebook.com https://appleid.apple.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://www.facebook.com https://appleid.apple.com",
    "upgrade-insecure-requests",
  ];
  return directives.join("; ");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Auth guards ───────────────────────────────────────────────────────────
  const isAdmin = ADMIN.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isAdmin || isProtected) {
    const { authenticated, role } = await resolveSession(request);

    if (!authenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdmin && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // ── Nonce-based CSP ───────────────────────────────────────────────────────
  const nonce = randomBytes(16).toString("base64");
  const csp = buildCSP(nonce);

  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
        "x-nonce": nonce,
      }),
    },
  });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|woff2?|ttf)).*)",
  ],
};
