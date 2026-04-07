import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { isSessionBlocked } from "@/lib/session-blocklist";

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

// Routes that require any authenticated session
const PROTECTED = ["/my-appointments", "/profile", "/book"];
// Routes that require ADMIN role
const ADMIN = ["/admin"];

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function buildCSP(nonce: string): string {
  return [
    "default-src 'self'",
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
  ].join("; ");
}

// NextAuth v5 pattern: wrap with auth() so the session is resolved by
// NextAuth itself (handles JWE decryption) and passed in as request.auth.
// Calling await auth() inside a plain middleware function causes recursive
// session resolution and breaks the OAuth redirect flow.
export const proxy = auth(async function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  // Enforce inactivity timeout and session revocation
  if (session?.user) {
    const lastActivity = (session.user as { lastActivity?: number }).lastActivity;
    if (lastActivity && Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("reason", "inactivity");
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("authjs.session-token");
      res.cookies.delete("__Secure-authjs.session-token");
      return res;
    }

    // Check if this token has been explicitly revoked (e.g. on logout)
    const jti = (session as unknown as { jti?: string }).jti;
    if (jti && await isSessionBlocked(jti)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("reason", "revoked");
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("authjs.session-token");
      res.cookies.delete("__Secure-authjs.session-token");
      return res;
    }
  }

  const isAdmin = ADMIN.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isAdmin || isProtected) {
    const authenticated = !!session?.user;
    const role = (session?.user as { role?: string } | undefined)?.role ?? "";

    if (!authenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdmin && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Attach nonce-based CSP to every response
  const nonce = generateNonce();
  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries((request as NextRequest).headers),
        "x-nonce": nonce,
      }),
    },
  });

  response.headers.set("Content-Security-Policy", buildCSP(nonce));
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");

  return response;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|woff2?|ttf)).*)",
  ],
};
