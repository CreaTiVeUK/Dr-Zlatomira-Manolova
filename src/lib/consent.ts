/**
 * The cookie banner's decision, shared between the banner and anything that
 * must wait for it. Stored in localStorage by CookieConsent; changes are
 * announced with CONSENT_EVENT so listeners react without a reload.
 */
export const CONSENT_KEY = "cookieConsent";
export const CONSENT_EVENT = "cookie-consent-change";

export function hasAnalyticsConsent(): boolean {
    try {
        return localStorage.getItem(CONSENT_KEY) === "true";
    } catch {
        return false;
    }
}
