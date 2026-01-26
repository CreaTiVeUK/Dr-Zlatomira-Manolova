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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Desktop Actions */}
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user.role === 'ADMIN' && (
                    <Link href="/admin/dashboard" className="btn btn-sm btn-outline" style={{ border: '1px solid var(--primary-teal)', color: 'var(--primary-teal)', fontWeight: '600', padding: '0.4rem 0.8rem', borderRadius: '4px', textDecoration: 'none' }}>
                        {dict.userMenu.dashboard}
                    </Link>
                )}
                {user.role === 'PATIENT' && (
                    <Link href="/my-appointments" className="btn btn-sm" style={{ color: 'var(--primary-teal)', fontWeight: '600', textDecoration: 'none' }}>
                        {dict.userMenu.appointments}
                    </Link>
                )}
            </div>

            {/* User Badge */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: '#f0f4f8',
                padding: '0.4rem 0.8rem',
                borderRadius: '2rem'
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
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="desktop-only" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#333' }}>
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
                    color: '#666',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    transition: 'color 0.2s'
                }}
                className="hover-text-primary"
            >
                {isPending ? '...' : dict.userMenu.logout}
            </button>
        </div>
    );
}
