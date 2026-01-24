"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

    const handleLogout = async () => {
        try {
            await fetch("/api/logout", { method: "POST" });
            startTransition(() => {
                router.push("/login");
                router.refresh();
            });
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    if (!user) {
        return (
            <Link href="/login" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}>
                ВХОД
            </Link>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {user.role === 'ADMIN' && (
                <Link href="/admin/dashboard" style={{ fontWeight: '700', color: 'var(--primary-teal)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                    Табло
                </Link>
            )}
            {user.role === 'PATIENT' && (
                <Link href="/my-appointments" style={{ fontWeight: '700', color: 'var(--primary-teal)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                    Часове
                </Link>
            )}
            <span style={{ fontWeight: '700', color: 'var(--text-charcoal)', fontSize: '0.9rem' }}>
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
                {isPending ? '...' : 'ИЗХОД'}
            </button>
        </div>
    );
}
