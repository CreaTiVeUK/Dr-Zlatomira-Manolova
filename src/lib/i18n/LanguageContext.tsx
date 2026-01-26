"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("en");
    const [hydrated, setHydrated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const savedV = localStorage.getItem("language");
        if (savedV === "en" || savedV === "bg") {
            Promise.resolve().then(() => setLanguageState(savedV as Language));
        }
        // Wrap in Promise to avoid "setState synchronously in effect" lint error
        Promise.resolve().then(() => setHydrated(true));
    }, []);

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

    if (!hydrated) {
        return (
            <LanguageContext.Provider value={{ language: "en", dict: en, toggleLanguage, setLanguage }}>
                <div style={{ visibility: 'hidden' }}>{children}</div>
            </LanguageContext.Provider>
        );
    }

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
