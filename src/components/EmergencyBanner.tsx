"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function EmergencyBanner() {
    const { dict } = useLanguage();

    return (
        <div style={{
            backgroundColor: "#fff5f5",
            borderBottom: "1px solid #feb2b2",
            padding: "0.75rem 0",
            textAlign: "center"
        }}>
            <div className="container">
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: "700", color: "#c53030" }}>
                    🚨 {dict.header.emergency.text} &nbsp;
                    <span style={{ fontWeight: "400", color: "#666" }}>
                        — {dict.header.emergency.sub}
                    </span>
                </p>
            </div>
        </div>
    );
}
