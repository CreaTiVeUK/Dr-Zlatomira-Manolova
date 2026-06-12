"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children, initialLanguage }: { children: React.ReactNode; initialLanguage?: "en" | "bg" }) {
    return (
        <SessionProvider>
            <LanguageProvider initialLanguage={initialLanguage}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </LanguageProvider>
        </SessionProvider>
    );
}
