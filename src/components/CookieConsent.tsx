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
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '2rem',
            right: '2rem',
            background: 'var(--bg-white)',
            boxShadow: 'var(--shadow-lg)',
            padding: '1.5rem',
            zIndex: 9999,
            borderRadius: '12px',
            maxWidth: '1200px',
            margin: '0 auto',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-charcoal)' }}>{dict.cookies?.title || "We respect your privacy"}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    {dict.cookies?.desc || "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking 'Accept', you consent to our use of cookies."}
                    {" "}
                    <Link href="/privacy" style={{ color: 'var(--primary-teal)', textDecoration: 'underline' }}>
                        {dict.cookies?.learnMore || "Learn more"}
                    </Link>
                </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                    onClick={handleReject}
                    className="btn btn-outline"
                    style={{ flex: '1', padding: '0.6rem 1.25rem' }}
                >
                    {dict.cookies?.reject || "Decline"}
                </button>
                <button
                    onClick={handleAccept}
                    className="btn btn-primary"
                    style={{ flex: '1', padding: '0.6rem 1.25rem' }}
                >
                    {dict.cookies?.accept || "Accept Cookies"}
                </button>
            </div>
        </div>
    );
}
