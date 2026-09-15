"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Loading() {
    const { dict } = useLanguage();

    return (
        <div className="state-shell" role="status" aria-live="polite">
            <div className="state-shell__panel">
                <div className="spinner" aria-hidden="true" />
                {/* Announced to screen readers only; sighted visitors just see the spinner. */}
                <span className="sr-only">{dict.loading.label}</span>
            </div>
        </div>
    );
}
