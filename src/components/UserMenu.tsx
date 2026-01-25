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
            // 1. Clear legacy session cookie
            await fetch("/api/logout", { method: "POST" });

            // 2. Clear Auth.js session and trigger redirect
            // signOut with a callbackUrl is very reliable for immediate state refresh
            await signOut({ callbackUrl: "/login" });
        } catch (err) {
            console.error("Logout failed:", err);
            // Hard redirect as ultimate fallback
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {user.role === 'ADMIN' && (
                    <Link href="/admin/dashboard" style={{ fontWeight: '700', color: 'var(--primary-teal)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        {dict.userMenu.dashboard}
                    </Link>
                )}
                {user.role === 'PATIENT' && (
                    <Link href="/my-appointments" style={{ fontWeight: '700', color: 'var(--primary-teal)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        {dict.userMenu.appointments}
                    </Link>
                )}
            </div>
            <span style={{ fontWeight: '700', color: 'var(--text-charcoal)', fontSize: '0.85rem' }}>
                {user.name.split(' ')[0]}
            </span>
            <button
                onClick={handleLogout}
                disabled={isPending}
                style={{
                    background: 'none',
                    border: '1px solid #ddd',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                }}
            >
                {isPending ? '...' : dict.userMenu.logout}
            </button>
        </div>
    );
}
