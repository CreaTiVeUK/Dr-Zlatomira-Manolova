/**
 * The canonical public origin of the site.
 *
 * This was hardcoded as "https://zlatipediatrics.com" in three separate
 * places — layout.tsx (metadataBase, canonical, hreflang, Open Graph, JSON-LD),
 * sitemap.ts and robots.ts — and that domain was never registered. Every page
 * therefore advertised a canonical URL that did not resolve, which is close to
 * the worst thing you can tell a search engine.
 *
 * Reading it from config instead means the domain is set once, in the
 * environment, and moving domains never requires a code change.
 *
 * Resolution order:
 *   APP_URL      the real domain — set this in production
 *   VERCEL_URL   per-deployment hostname; correct-ish but unstable, so it is a
 *                fallback that keeps previews working, never the config
 *   localhost    development
 */
export function getSiteUrl(): string {
    const appUrl = process.env.APP_URL;
    if (appUrl) return appUrl.replace(/\/+$/, "");
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
}
