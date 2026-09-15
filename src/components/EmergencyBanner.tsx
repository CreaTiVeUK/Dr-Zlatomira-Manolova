"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const KEY = "emergencyBannerDismissed";
const EVENT = "emergency-banner-change";

function subscribe(cb: () => void) {
    window.addEventListener(EVENT, cb);
    return () => window.removeEventListener(EVENT, cb);
}
function isDismissed(): boolean {
    try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; }
}

/**
 * The "call 112" line is a real safety message and stays on every page — but
 * as one compact line, not a fifth of a phone screen. Dismissal lasts the
 * browser session so the practice's own message gets the first screen back.
 */
export default function EmergencyBanner() {
    const { dict } = useLanguage();
    const pathname = usePathname();
    const dismissed = useSyncExternalStore(subscribe, isDismissed, () => false);

    if (pathname.startsWith("/admin") || dismissed) return null;

    const dismiss = () => {
        try { sessionStorage.setItem(KEY, "1"); } catch { /* storage unavailable */ }
        window.dispatchEvent(new Event(EVENT));
    };

    return (
        <div className="emergency-banner" role="note" aria-label={dict.header.emergency.text}>
            <div className="container emergency-banner__inner">
                <span className="emergency-banner__icon" aria-hidden="true">!</span>
                <p className="emergency-banner__title">
                    <a href="tel:112">{dict.header.emergency.text}</a>
                    <span className="emergency-banner__subtitle"> · {dict.header.emergency.sub}</span>
                </p>
                <button type="button" className="emergency-banner__close" onClick={dismiss} aria-label={dict.header.closeMenu}>
                    <X size={16} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
