"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { track } from "@vercel/analytics";
import { CONSENT_EVENT, hasAnalyticsConsent } from "@/lib/consent";

/**
 * Vercel Web Analytics, mounted only after the visitor accepts the cookie
 * banner, plus the handful of outcome events that matter for a practice
 * website: calls, booking clicks, emails and directions.
 *
 * Tracking is delegated from one document-level listener so no CTA anywhere
 * on the site needs instrumenting — a phone link is a phone link wherever it
 * lives. Nothing about the visitor or the appointment is ever attached.
 */

/** Signed-in areas: nothing there is useful for SEO measurement, and their
 *  URLs can identify a patient. Never reported. */
const PRIVATE_PREFIXES = ["/admin", "/profile", "/my-appointments", "/messages", "/book", "/auth"];

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
    const url = new URL(event.url);
    if (PRIVATE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return null;
    // Query strings carry email-verification and password-reset tokens.
    url.search = "";
    url.hash = "";
    return { ...event, url: url.toString() };
}

function subscribe(onChange: () => void) {
    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
        window.removeEventListener(CONSENT_EVENT, onChange);
        window.removeEventListener("storage", onChange);
    };
}

function eventFor(href: string): string | null {
    if (href.startsWith("tel:")) return "phone_click";
    if (href.startsWith("mailto:")) return "email_click";
    if (href === "/book" || href.startsWith("/book?")) return "booking_cta_click";
    if (href.includes("google.com/maps/dir")) return "directions_click";
    return null;
}

export default function ConsentedAnalytics() {
    // Server snapshot is false so the first client render matches the HTML.
    const enabled = useSyncExternalStore(subscribe, hasAnalyticsConsent, () => false);

    useEffect(() => {
        if (!enabled) return;
        const onClick = (e: MouseEvent) => {
            const anchor = (e.target as Element | null)?.closest?.("a[href]");
            const name = anchor && eventFor(anchor.getAttribute("href") ?? "");
            if (name) track(name);
        };
        document.addEventListener("click", onClick, { capture: true });
        return () => document.removeEventListener("click", onClick, { capture: true });
    }, [enabled]);

    if (!enabled) return null;
    return <Analytics beforeSend={beforeSend} />;
}
