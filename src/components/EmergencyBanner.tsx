"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function EmergencyBanner() {
    const { dict } = useLanguage();

    return (
        <div className="emergency-banner" role="note" aria-label="Emergency notice">
            <div className="container emergency-banner__inner">
                <span className="emergency-banner__icon" aria-hidden="true">
                    !
                </span>
                <div className="emergency-banner__copy">
                    <p className="emergency-banner__title">{dict.header.emergency.text}</p>
                    <p className="emergency-banner__subtitle">{dict.header.emergency.sub}</p>
                </div>
            </div>
        </div>
    );
}
