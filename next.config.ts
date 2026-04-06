import type { NextConfig } from "next";

const CSP = [
    "default-src 'self'",
    // Next.js hydration requires unsafe-inline; unsafe-eval needed by some React internals
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://connect.facebook.net https://appleid.apple.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self'",
    // API connections (OpenAI/Resend calls are server-side only)
    "connect-src 'self' https://accounts.google.com https://www.facebook.com https://appleid.apple.com",
    // OAuth popups / iframes
    "frame-src https://accounts.google.com https://www.facebook.com https://appleid.apple.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://www.facebook.com https://appleid.apple.com",
    "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
    output: "standalone",
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
                    { key: "Content-Security-Policy", value: CSP },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
                    },
                ],
            },
        ];
    },
    // Limit request body to prevent memory exhaustion
    experimental: {
        serverActions: {
            bodySizeLimit: "4mb",
        },
    },
};

export default nextConfig;
