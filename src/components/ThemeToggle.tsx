"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const { dict } = useLanguage();
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

    if (!mounted) {
        return <div style={{ width: '40px', height: '40px' }} />;
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={dict.theme.toggle}
            className="theme-toggle-btn"
            type="button"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
