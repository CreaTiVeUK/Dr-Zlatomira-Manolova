"use client";

import React, { createContext, useContext, useState } from "react";
import { en, bg, Dictionary } from "./dictionaries";
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
    if (typeof window === "undefined") return "en";
    // 1. Prefer cookie (set by both SSR and client — no useEffect delay)
    const cookieMatch = document.cookie.match(/(?:^|;\s*)language=([^;]*)/);
    if (cookieMatch && (cookieMatch[1] === "en" || cookieMatch[1] === "bg")) {
        return cookieMatch[1] as Language;
    }
    // 2. Fallback to localStorage
    const saved = localStorage.getItem("language");
    if (saved === "en" || saved === "bg") return saved as Language;
    return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Initializer function runs synchronously — no useEffect needed, no flash
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);
    const router = useRouter();

    const toggleLanguage = () => {
        const newLang = language === "en" ? "bg" : "en";
        setLanguageState(newLang);
        localStorage.setItem("language", newLang);
        document.cookie = `language=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
        router.refresh();
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
        document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
        router.refresh();
    };

    const dict = language === "en" ? en : bg;

    return (
        <LanguageContext.Provider value={{ language, dict, toggleLanguage, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
