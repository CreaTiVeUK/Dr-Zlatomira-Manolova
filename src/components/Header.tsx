"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ThemeToggle from "./ThemeToggle";

interface HeaderProps {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    } | null;
}

export default function Header({ user }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { language, toggleLanguage, dict } = useLanguage();
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) return null;

    return (
        <>
            {/* Utility Bar */}
            <div className="header-utility-bar">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="contact-info" style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', fontWeight: '500' }}>
                        <a href="tel:+359885557110" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ opacity: 0.7 }}>TEL:</span> +359 88 5557110
                        </a>
                        <a href="mailto:zlatomira.manolova@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ opacity: 0.7 }}>EMAIL:</span> zlatomira.manolova@gmail.com
                        </a>
                        <div className="clinical-badge" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>
                            {dict.header.ageGroup}
                        </div>
                    </div>

                    <button
                        onClick={toggleLanguage}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0 0.5rem',
                            transition: 'var(--transition-fast)'
                        }}
                        title={dict.header.switchTitle}
                    >
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                            {language === 'en' ? 'BG' : 'EN'}
                        </span>
                        {language === 'en' ? '🇧🇬' : '🇬🇧'}
                    </button>

                    <div style={{ height: '16px', width: '1px', background: 'var(--border)', margin: '0 0.5rem' }}></div>

                    <ThemeToggle />
                </div>
            </div>

            {/* Main Header */}
            <header className="header-main">
                <div className="container header-container">
                    <div className="header-logo">
                        <Link href="/" className="logo-section">
                            <div className="logo-text">{dict.header.title}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                {dict.header.subtitle}
                            </div>
                        </Link>
                    </div>

                    <nav className="nav-center" style={{ gap: '1.5rem' }}>
                        <Link href="/">{dict.header.nav.home}</Link>
                        <Link href="/services">{dict.header.nav.services}</Link>
                        <Link href="/conditions">{dict.header.nav.conditions}</Link>
                        <Link href="/resources">{dict.header.nav.resources}</Link>
                        <Link href="/book" style={{ whiteSpace: 'nowrap' }}>{dict.header.nav.book}</Link>
                        <Link href="/contact">{dict.header.nav.contact}</Link>

                        {/* Dynamic User Links Spaced Identically */}
                        {user && (
                            <>
                                {user.role === 'ADMIN' ? (
                                    <Link href="/admin/dashboard" style={{ fontWeight: '700', color: 'var(--primary-teal)' }}>
                                        {dict.userMenu.dashboard}
                                    </Link>
                                ) : (
                                    <Link href="/my-appointments" style={{ fontWeight: '700', color: 'var(--primary-teal)' }}>
                                        {dict.userMenu.appointments}
                                    </Link>
                                )
                                }
                            </>
                        )}
                    </nav>

                    <div className="header-actions">
                        <UserMenu user={user} />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        style={{ padding: '0.75rem', fontSize: '1.8rem', marginRight: '-0.75rem' }}
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? '✕' : '☰'}
                    </button>

                    {/* Mobile Navigation */}
                    <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
                        <Link href="/" onClick={() => setIsMenuOpen(false)}>{dict.header.nav.home}</Link>
                        <Link href="/services" onClick={() => setIsMenuOpen(false)}>{dict.header.nav.services}</Link>
                        <Link href="/conditions" onClick={() => setIsMenuOpen(false)}>{dict.header.nav.conditions}</Link>
                        <Link href="/resources" onClick={() => setIsMenuOpen(false)}>{dict.header.nav.resources}</Link>
                        <Link href="/book" onClick={() => setIsMenuOpen(false)}>{dict.header.nav.book}</Link>
                        <Link href="/contact" onClick={() => setIsMenuOpen(false)}>{dict.header.nav.contact}</Link>

                        {/* Role-specific links for mobile */}
                        {user && (
                            <>
                                <div style={{ borderTop: '1px solid var(--border)', width: '100%', margin: '0.5rem 0' }}></div>
                                {user.role === 'ADMIN' ? (
                                    <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)} style={{ fontWeight: '700', color: 'var(--primary-teal)' }}>
                                        {dict.userMenu.dashboard}
                                    </Link>
                                ) : (
                                    <Link href="/my-appointments" onClick={() => setIsMenuOpen(false)} style={{ fontWeight: '700', color: 'var(--primary-teal)' }}>
                                        {dict.userMenu.appointments}
                                    </Link>
                                )}
                            </>
                        )}

                        <div style={{ borderTop: '1px solid var(--border)', width: '100%', margin: '0.5rem 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                    onClick={toggleLanguage}
                                    style={{
                                        background: 'var(--bg-header-alt)',
                                        border: '1px solid var(--border)',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        padding: '0.6rem 1rem',
                                        borderRadius: '8px',
                                        color: 'var(--text-charcoal)',
                                        fontWeight: '600'
                                    }}
                                >
                                    {language === 'en' ? '🇧🇬 BG' : '🇬🇧 EN'}
                                </button>
                                <ThemeToggle />
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', width: '100%', margin: '0.5rem 0' }}></div>
                        <UserMenu user={user} />
                    </nav>
                </div>
            </header>
        </>
    );
}
