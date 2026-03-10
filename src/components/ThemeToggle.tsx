"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

    if (!mounted) {
        return <div style={{ width: '40px', height: '40px' }} />;
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-charcoal)',
                transition: 'var(--transition-fast)',
                borderRadius: '50%',
            }}
            aria-label="Toggle Theme"
            className="theme-toggle-btn"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <style jsx>{`
                .theme-toggle-btn:hover {
                    background: var(--bg-soft);
                    color: var(--primary-teal);
                    transform: rotate(15deg);
                }
            `}</style>
        </button>
    );
}
