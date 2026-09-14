"use client";

import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";
import { CONSENT_EVENT, privacySignalDenies, readConsentDecision } from "@/lib/consent";

/**
 * Loads gtag.js for the Google Ads / GA4 property — but only once consent
 * is granted, and keeps Consent Mode in step with the banner afterwards.
 *
 * "Basic" Consent Mode on purpose: an already-loaded gtag.js in denied
 * state still sends cookieless pings, and this site's rule is that nothing
 * reaches Google before the visitor says yes. The denied default and the
 * stored-decision replay are queued by GoogleConsentDefaults (inline, in
 * <head>), so when the library finally loads it processes
 * default → update → config in order. Accept therefore takes effect in the
 * same session with no reload; Decline never loads anything; a browser
 * Do Not Track / Global Privacy Control signal counts as Decline.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const SIGNALS = ["ad_storage", "analytics_storage", "ad_user_data", "ad_personalization"] as const;

declare global {
    interface Window {
        dataLayer?: unknown[];
    }
}

// gtag.js requires a real `arguments` object on the queue, not an array —
// hence a classic function reading `arguments`, and a typed signature for callers.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtag(..._args: unknown[]) {
    window.dataLayer = window.dataLayer || [];
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
}

function consentGranted(): boolean {
    return readConsentDecision() === "granted" && !privacySignalDenies();
}

function subscribe(onChange: () => void) {
    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
        window.removeEventListener(CONSENT_EVENT, onChange);
        window.removeEventListener("storage", onChange);
    };
}

export default function GoogleTag() {
    // Server snapshot is false so the first client render matches the HTML.
    const granted = useSyncExternalStore(subscribe, consentGranted, () => false);

    // Mirror every change into Consent Mode. Before the library loads this
    // just queues; after it loads (Accept, then later a reset to denied) it
    // is what actually stops cookie writes and ad personalisation.
    useEffect(() => {
        if (!GA_ID) return;
        const state = granted ? "granted" : "denied";
        gtag("consent", "update", Object.fromEntries(SIGNALS.map((s) => [s, state])));
    }, [granted]);

    if (!GA_ID || !granted) return null;
    return <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`} strategy="afterInteractive" />;
}
