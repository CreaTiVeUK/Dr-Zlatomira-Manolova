"use client";

import { useTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface UserMenuProps {
    user: {
        name: string;
        email: string;
        role: string;
    } | null;
}

export default function UserMenu({ user }: UserMenuProps) {
    const [isPending, startTransition] = useTransition();
    const { dict } = useLanguage();

    const handleLogout = async () => {
        startTransition(async () => {
            try {
                await fetch("/api/logout", { method: "POST" });
                await signOut({ callbackUrl: "/login" });
            } catch (err) {
                console.error("Logout failed:", err);
                window.location.href = "/login";
            }
        });
    };

    if (!user) {
        return (
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}>
                {dict.userMenu.login}
            </Link>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* User Profile */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'default'
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary-teal)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '1rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="desktop-only" style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-charcoal)' }}>
                    {user.name ? user.name.split(' ')[0] : 'User'}
                </span>
            </div>

            {/* Separator */}
            <div className="desktop-only" style={{ height: '16px', width: '1px', background: '#ddd', margin: '0 0.5rem' }}></div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                disabled={isPending}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#888',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'color 0.2s'
                }}
                className="hover-text-primary"
            >
                {isPending ? '...' : dict.userMenu.logout}
            </button>
        </div>
    );
}
