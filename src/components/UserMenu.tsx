"use client";

import { useTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface UserMenuProps {
    user: {
        name: string;
        email: string;
        role: string;
    } | null;
}

export default function UserMenu({ user }: UserMenuProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { dict } = useLanguage();

    const handleLogout = async () => {
        try {
            await fetch("/api/logout", { method: "POST" });
            await signOut({ callbackUrl: "/login" });
        } catch (err) {
            console.error("Logout failed:", err);
            window.location.href = "/login";
        }
    };

    if (!user) {
        return (
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}>
                {dict.userMenu.login}
            </Link>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Desktop Actions */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {user.role === 'ADMIN' && (
                    <Link href="/admin/dashboard" style={{ color: 'var(--primary-teal)', fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {dict.userMenu.dashboard}
                    </Link>
                )}
                {user.role === 'PATIENT' && (
                    <Link href="/my-appointments" style={{ color: 'var(--primary-teal)', fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {dict.userMenu.appointments}
                    </Link>
                )}
            </div>

            {/* Separator */}
            <div className="desktop-only" style={{ height: '16px', width: '1px', background: '#ddd' }}></div>

            {/* User Badge */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'default'
            }}>
                <div style={{
                    width: '30px',
                    height: '30px',
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
                    transition: 'color 0.2s',
                    marginLeft: '0.5rem'
                }}
                className="hover-text-primary"
            >
                {isPending ? '...' : dict.userMenu.logout}
            </button>
        </div>
    );
}
