"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function EmergencyBanner() {
    const { dict } = useLanguage();

    return (
        <div style={{
            backgroundColor: "#fff5f5",
            borderBottom: "1px solid #feb2b2",
            padding: "0.6rem 0",
            textAlign: "center"
        }}>
            <div className="container">
                <p style={{
                    margin: 0,
                    fontSize: "var(--mobile-smaller, 0.8rem)",
                    lineHeight: 1.5,
                    fontWeight: "900",
                    color: "#c53030"
                }}>
                    🚨 {dict.header.emergency.text}
                </p>
                <p style={{
                    margin: 0,
                    fontSize: "var(--mobile-smaller, 0.75rem)",
                    lineHeight: 1.4,
                    fontWeight: "500",
                    color: "#666"
                }}>
                    {dict.header.emergency.sub}
                </p>
            </div>
            <style jsx>{`
                @media (max-width: 480px) {
                    p { font-size: 0.75rem !important; }
                }
            `}</style>
        </div>
    );
}
