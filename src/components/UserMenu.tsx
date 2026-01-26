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
        <div className="user-menu-container" style={{ position: 'relative' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                padding: '0.4rem 0.6rem',
                borderRadius: '8px',
                transition: 'var(--transition-fast)'
            }}
                className="user-badge-trigger"
            >
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
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--text-charcoal)' }}>
                        {user.name ? user.name.split(' ')[0] : 'User'}
                    </span>
                    <span style={{ fontSize: '0.6rem', color: '#888' }}>▼</span>
                </div>
            </div>

            {/* Dropdown Menu */}
            <div className="user-dropdown">
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.75rem', color: '#888', fontWeight: '600' }}>
                    {user.email}
                </div>

                {user.role === 'ADMIN' && (
                    <Link href="/admin/dashboard" className="dropdown-item">
                        {dict.userMenu.dashboard}
                    </Link>
                )}

                {user.role === 'PATIENT' && (
                    <Link href="/my-appointments" className="dropdown-item">
                        {dict.userMenu.appointments}
                    </Link>
                )}

                <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '0.25rem' }}>
                    <button
                        onClick={handleLogout}
                        disabled={isPending}
                        className="dropdown-item logout-btn"
                        style={{ width: '100%', textAlign: 'left', color: '#c53030' }}
                    >
                        {isPending ? '...' : dict.userMenu.logout}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .user-menu-container:hover .user-dropdown {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: all;
                }
                .user-badge-trigger:hover {
                    background: #f1f5f9;
                }
                .user-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 0.5rem;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                    min-width: 180px;
                    z-index: 1000;
                    opacity: 0;
                    transform: translateY(10px);
                    pointer-events: none;
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    overflow: hidden;
                }
                .dropdown-item {
                    display: block;
                    padding: 0.75rem 1rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-charcoal);
                    text-decoration: none;
                    transition: background 0.2s;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                }
                .dropdown-item:hover {
                    background: #f8fafc;
                    color: var(--primary-teal);
                }
                .logout-btn:hover {
                    background: #fff5f5 !important;
                    color: #e53e3e !important;
                }
            `}</style>
        </div>
    );
}
