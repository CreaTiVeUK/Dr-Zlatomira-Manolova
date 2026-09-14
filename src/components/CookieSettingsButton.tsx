"use client";

import { clearConsentDecision } from "@/lib/consent";

/** Lets a visitor withdraw or revisit their cookie choice — the banner
 *  reappears and every consent-gated tool drops back to denied at once. */
export default function CookieSettingsButton({ label }: { label: string }) {
    return (
        <button type="button" className="btn btn-outline" onClick={clearConsentDecision}>
            {label}
        </button>
    );
}
