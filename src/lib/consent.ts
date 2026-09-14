/**
 * The cookie banner's decision, shared between the banner and anything that
 * must wait for it. Stored in localStorage by CookieConsent; changes are
 * announced with CONSENT_EVENT so listeners react without a reload.
 *
 * Also the one place that decides what a browser privacy signal means: a
 * Do Not Track or Global Privacy Control header is treated as a refusal,
 * whatever the banner says.
 */
export const CONSENT_KEY = "cookieConsent";
export const CONSENT_EVENT = "cookie-consent-change";

export type ConsentDecision = "granted" | "denied" | null;

/** The visitor's stored answer, or null if they have not been asked yet. */
export function readConsentDecision(): ConsentDecision {
    try {
        const v = localStorage.getItem(CONSENT_KEY);
        return v === "true" ? "granted" : v === "false" ? "denied" : null;
    } catch {
        return null;
    }
}

/** True when the browser itself asks not to be tracked (DNT or GPC). */
export function privacySignalDenies(): boolean {
    if (typeof navigator === "undefined") return false;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
    const win = window as Window & { doNotTrack?: string };
    return nav.doNotTrack === "1" || win.doNotTrack === "1" || nav.msDoNotTrack === "1" || nav.globalPrivacyControl === true;
}

export function hasAnalyticsConsent(): boolean {
    return readConsentDecision() === "granted" && !privacySignalDenies();
}

/** Forget the stored answer so the banner asks again; listeners drop to denied. */
export function clearConsentDecision(): void {
    try {
        localStorage.removeItem(CONSENT_KEY);
    } catch {
        /* storage unavailable — nothing to clear */
    }
    window.dispatchEvent(new Event(CONSENT_EVENT));
}
