/**
 * POST /api/csp-report
 *
 * Receives Content Security Policy violation reports from browsers. Logs to
 * stderr in a structured format so Vercel logs capture them. Rate-limited per
 * IP because a malicious page can cause the visitor's browser to spam us.
 *
 * Accepts both legacy `application/csp-report` (report-uri) and modern
 * `application/reports+json` (report-to) bodies.
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

interface CspReportLegacy {
    "csp-report": {
        "document-uri"?: string;
        "blocked-uri"?: string;
        "violated-directive"?: string;
        "effective-directive"?: string;
        "source-file"?: string;
        "line-number"?: number;
        "script-sample"?: string;
    };
}

interface CspReportModern {
    type: string;
    body: {
        documentURL?: string;
        blockedURL?: string;
        effectiveDirective?: string;
        sourceFile?: string;
        lineNumber?: number;
    };
}

function normalize(payload: unknown): Record<string, unknown> | null {
    if (!payload || typeof payload !== "object") return null;

    if ("csp-report" in payload) {
        const r = (payload as CspReportLegacy)["csp-report"];
        return {
            documentUri: r["document-uri"],
            blockedUri: r["blocked-uri"],
            directive: r["violated-directive"] ?? r["effective-directive"],
            sourceFile: r["source-file"],
            lineNumber: r["line-number"],
            scriptSample: r["script-sample"],
        };
    }

    if (Array.isArray(payload) && payload[0]?.body) {
        const r = (payload[0] as CspReportModern).body;
        return {
            documentUri: r.documentURL,
            blockedUri: r.blockedURL,
            directive: r.effectiveDirective,
            sourceFile: r.sourceFile,
            lineNumber: r.lineNumber,
        };
    }

    return null;
}

export async function POST(request: NextRequest) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limiter = await rateLimit(`csp:${ip}`, 30, 60_000);
    if (!limiter.success) return new NextResponse(null, { status: 429 });

    try {
        const payload = await request.json().catch(() => null);
        const report = normalize(payload);
        if (!report) return new NextResponse(null, { status: 400 });

        console.warn("[CSP VIOLATION]", JSON.stringify(report));
    } catch (err) {
        console.error("[csp-report] parse error:", err);
    }

    // Always 204 — browsers don't retry, and leaking failures is useless
    return new NextResponse(null, { status: 204 });
}
