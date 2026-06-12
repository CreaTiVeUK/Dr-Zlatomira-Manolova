import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSessionBlocked, isUserRevoked } from "@/lib/session-blocklist";

// Routes that require any authenticated session
const PROTECTED = ["/my-appointments", "/profile", "/book"];
// Routes that require ADMIN role
const ADMIN = ["/admin"];

function buildCSP(): string {
  // 'unsafe-inline' is required because Next.js injects inline scripts for
  // hydration and chunk-loading that cannot carry a nonce without deep
  // framework integration. 'unsafe-eval' is NOT included — production Next.js
  // bundles don't eval (only dev tooling does). Violations are reported to
  // /api/csp-report so regressions surface in the logs.
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://accounts.google.com https://connect.facebook.net https://appleid.apple.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self'",
    "connect-src 'self' https://accounts.google.com https://www.facebook.com https://appleid.apple.com",
    "frame-src https://accounts.google.com https://www.facebook.com https://appleid.apple.com https://maps.google.com https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://www.facebook.com https://appleid.apple.com",
    "upgrade-insecure-requests",
    "report-uri /api/csp-report",
  ];
  if (process.env.NODE_ENV !== "production") {
    // next dev relies on eval'd source maps / react-refresh
    directives[1] += " 'unsafe-eval'";
  }
  return directives.join("; ");
}

// Expire both session cookie variants. cookies.delete() must not be used
// here: it emits a Set-Cookie without the Secure attribute, and browsers
// silently reject any mutation of a __Secure--prefixed cookie that lacks it —
// so in production the stale cookie survived and the redirect-to-login below
// looped forever (503 via Vercel loop detection).
function expireSessionCookies(res: NextResponse): void {
  res.cookies.set("authjs.session-token", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  res.cookies.set("__Secure-authjs.session-token", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  });
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("Content-Security-Policy", buildCSP());
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  // microphone=(self) — allows the admin AudioRecorder component (same-origin only)
  res.headers.set("Permissions-Policy", "camera=(), microphone=(self), geolocation=(), payment=(), usb=()");
  return res;
}

// NextAuth v5 pattern: wrap with auth() so the session is resolved by
// NextAuth itself (handles JWE decryption) and passed in as request.auth.
// Calling await auth() inside a plain middleware function causes recursive
// session resolution and breaks the OAuth redirect flow.
export const proxy = auth(async function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = request.auth;

  const isAdmin = ADMIN.some((p) => pathname.startsWith(p));
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  // Enforce inactivity timeout and session revocation
  if (session?.user) {
    const flags = session as unknown as { invalidated?: string; jti?: string; issuedAt?: number };
    const userId = (session.user as { id?: string }).id;

    // Inactivity is enforced in the jwt callback (which compares the previous
    // lastActivity before refreshing it) and surfaced here as a flag.
    // Per-token revocation (logout) and per-user revocation (account deletion,
    // password reset — kills sessions on all devices).
    const reason = flags.invalidated
      ? "inactivity"
      : (flags.jti && (await isSessionBlocked(flags.jti))) ||
          (userId && flags.issuedAt && (await isUserRevoked(userId, flags.issuedAt)))
        ? "revoked"
        : null;

    if (reason) {
      // Only routes that actually require a session get bounced to /login
      // with an explanation. Public routes — including /login itself and the
      // /api/auth endpoints the login flow depends on — just get the dead
      // cookie cleared and render normally as logged-out: a stale session
      // must never redirect a public page (that's how the /login self-
      // redirect loop happened) or lock the user out of logging back in.
      let res: NextResponse;
      if (isAdmin || isProtected) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("reason", reason);
        res = NextResponse.redirect(loginUrl);
      } else {
        res = applySecurityHeaders(NextResponse.next());
      }
      expireSessionCookies(res);
      return res;
    }
  }

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

  return applySecurityHeaders(NextResponse.next());
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|woff2?|ttf)).*)",
  ],
};
