"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Dictionary, en, bg } from "./dictionaries";

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedV = localStorage.getItem("language") as Language;
        if (savedV && (savedV === "en" || savedV === "bg")) {
            setLanguageState(savedV);
        }
    }, []);

    const toggleLanguage = () => {
        const newLang = language === "en" ? "bg" : "en";
        setLanguageState(newLang);
        localStorage.setItem("language", newLang);
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
    };

    const dict = language === "en" ? en : bg;

    // Prevent hydration mismatch by rendering nothing until mounted, or just render default (English) but be aware of flicker
    // For SEO heavy sites, this simple approach renders default server side (English) and then might switch on client.
    // Since English is default requested by user, this is perfect.

    return (
        <LanguageContext.Provider value={{ language, dict, toggleLanguage, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
