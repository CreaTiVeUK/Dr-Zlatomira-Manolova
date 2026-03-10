"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const { dict } = useLanguage();

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        if (consent === null) {
            // Defer state update to next tick to avoid "set-state-in-effect" lint error
            setTimeout(() => setIsVisible(true), 0);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookieConsent", "true");
        setIsVisible(false);
    };

    const handleReject = () => {
        localStorage.setItem("cookieConsent", "false");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-banner" role="dialog" aria-live="polite" aria-label={dict.cookies?.title || "Cookie consent"}>
            <div className="cookie-banner__panel">
                <div className="stack-md">
                    <h3>{dict.cookies?.title || "We respect your privacy"}</h3>
                    <p>
                    {dict.cookies?.desc || "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking 'Accept', you consent to our use of cookies."}
                    {" "}
                    <Link href="/privacy" style={{ color: 'var(--primary-teal)', textDecoration: 'underline' }}>
                        {dict.cookies?.learnMore || "Learn more"}
                    </Link>
                    </p>
                </div>

                <div className="cookie-banner__actions">
                    <button onClick={handleReject} className="btn btn-outline" type="button">
                        {dict.cookies?.reject || "Decline"}
                    </button>
                    <button onClick={handleAccept} className="btn btn-primary" type="button">
                        {dict.cookies?.accept || "Accept Cookies"}
                    </button>
                </div>
            </div>
        </div>
    );
}
