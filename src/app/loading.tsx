"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Loading() {
    const { dict } = useLanguage();

    return (
        <div className="state-shell">
            <div className="state-shell__panel">
                <div className="spinner" aria-hidden="true" />
                <p>{dict.loading.preparingClinicData}</p>
            </div>
        </div>
    );
}
