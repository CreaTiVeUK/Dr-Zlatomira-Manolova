"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { Dictionary } from "./en";
import { en } from "./en";
import { bg } from "./bg";
import { useRouter } from "next/navigation";

type Language = "en" | "bg";

interface LanguageContextType {
    language: Language;
    dict: Dictionary;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function dictFor(lang: Language): Dictionary {
    return lang === "en" ? en : bg;
}

function getClientLanguage(): Language | null {
    if (typeof window === "undefined") return null;
    const cookieMatch = document.cookie.match(/(?:^|;\s*)language=([^;]*)/);
    if (cookieMatch && (cookieMatch[1] === "en" || cookieMatch[1] === "bg")) {
        return cookieMatch[1] as Language;
    }
    const saved = localStorage.getItem("language");
    if (saved === "en" || saved === "bg") return saved as Language;
    return null;
}

function persist(lang: Language) {
    localStorage.setItem("language", lang);
    const secure = typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `language=${lang}; path=/; max-age=31536000; SameSite=Strict${secure ? "; Secure" : ""}`;
}

export function LanguageProvider({
    children,
    initialLanguage,
}: {
    children: React.ReactNode;
    /** Cookie-derived language resolved on the SERVER — keeps SSR markup and
     *  hydration in agreement. Default: Bulgarian (primary audience). */
    initialLanguage?: Language;
}) {
    // The server-resolved value wins so server- and client-rendered content
    // agree; the client sniff only covers legacy localStorage-only visitors.
    const [language, setLanguageState] = useState<Language>(
        () => initialLanguage ?? getClientLanguage() ?? "bg"
    );
    // Both dictionaries are imported statically so the initial render is
    // already in the right language — the previous lazy import made every
    // page flash English before settling on Bulgarian.
    const [dict, setDict] = useState<Dictionary>(() => dictFor(initialLanguage ?? getClientLanguage() ?? "bg"));
    const router = useRouter();

    useEffect(() => {
        setDict(dictFor(language));
    }, [language]);

    // Legacy visitors who chose a language before the cookie existed have it
    // only in localStorage — honour it once and persist the cookie.
    useEffect(() => {
        const clientPref = getClientLanguage();
        if (clientPref && clientPref !== language) {
            setLanguageState(clientPref);
            persist(clientPref);
            router.refresh();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
