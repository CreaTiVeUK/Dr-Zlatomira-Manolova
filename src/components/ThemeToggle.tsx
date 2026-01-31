"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div style={{ width: '40px', height: '40px' }} />;
    }

    const isDark = theme === 'dark';

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
