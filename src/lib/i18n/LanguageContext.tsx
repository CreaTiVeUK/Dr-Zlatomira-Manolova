"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Dictionary } from "./en";
import { en } from "./en";
import { useRouter } from "next/navigation";

type Language = "en" | "bg";

interface LanguageContextType {
    language: Language;
    dict: Dictionary;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
    if (typeof window === "undefined") return "bg";
    const cookieMatch = document.cookie.match(/(?:^|;\s*)language=([^;]*)/);
    if (cookieMatch && (cookieMatch[1] === "en" || cookieMatch[1] === "bg")) {
        return cookieMatch[1] as Language;
    }
    const saved = localStorage.getItem("language");
    if (saved === "en" || saved === "bg") return saved as Language;
    return "bg"; // default: Bulgarian — primary audience
}

function persist(lang: Language) {
    localStorage.setItem("language", lang);
    document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);
    const [dict, setDict] = useState<Dictionary>(en);
    const router = useRouter();

    // Lazy-load the inactive language bundle
    useEffect(() => {
        if (language === "en") {
            setDict(en);
        } else {
            import("./bg").then((m) => setDict(m.bg));
        }
    }, [language]);

    const toggleLanguage = () => {
        const next = language === "en" ? "bg" : "en";
        setLanguageState(next);
        persist(next);
        router.refresh();
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        persist(lang);
        router.refresh();
    };

    return (
        <LanguageContext.Provider value={{ language, dict, toggleLanguage, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
    return context;
}
