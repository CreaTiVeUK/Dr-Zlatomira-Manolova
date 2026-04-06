import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

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
  const directives = [
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
  ];
  return directives.join("; ");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdmin = ADMIN.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isAdmin || isProtected) {
    // Use NextAuth's own session resolver — handles JWE tokens correctly
    const session = await auth();
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

  // Nonce-based CSP on every response
  const nonce = generateNonce();
  const response = NextResponse.next({
    request: {
      headers: new Headers({
        ...Object.fromEntries(request.headers),
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
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|woff2?|ttf)).*)",
  ],
};
