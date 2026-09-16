import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // AVIF first: smaller than WebP for photographic content (the practice
    // photos on /, /contact, /services). Browsers that don't support it get
    // Next's existing WebP output automatically — this only adds a smaller
    // option ahead of it, nothing is removed.
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // The project's *.vercel.app hostnames serve the exact same pages as the
    // custom domain, and Google indexed drzlatomiramanolova.vercel.app
    // alongside www.drmanolova.bg — a duplicate-content split that divides the
    // ranking signal for every page. A 308 at the CDN edge collapses them.
    //
    // Gated on VERCEL_ENV at build time so that only production builds carry
    // it: preview deployments keep their own hostname and stay browsable
    // (they are marked noindex in proxy.ts instead). The /api/ exclusion
    // matters — Vercel's cron scheduler invokes /api/cron/* against the
    // deployment hostname, and a redirect there would silently stop the
    // reminder and purge jobs from ever running.
    // Same source of truth as getSiteUrl() in src/lib/site-url.ts — the
    // canonical origin is configured once, in APP_URL, never in code. The
    // literal is only a floor so a misconfigured build cannot redirect the
    // site to "undefined".
    const canonicalOrigin = (process.env.APP_URL || "https://www.drmanolova.bg").replace(/\/+$/, "");
    const canonicalHostRedirects =
      process.env.VERCEL_ENV === "production"
        ? [
            {
              source: "/:path((?!api/).*)",
              has: [{ type: "host" as const, value: ".*\\.vercel\\.app" }],
              destination: `${canonicalOrigin}/:path`,
              permanent: true,
            },
          ]
        : [];

    return [
      ...canonicalHostRedirects,
      // Allergy care is not offered; the page was removed on 2026-09-15.
      { source: "/services/allergy", destination: "/services", permanent: true },
      // Newborn care merged into the main services page as its own section
      // on 2026-09-15, rather than living on its own route.
      { source: "/services/newborn", destination: "/services#newborn", permanent: true },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
