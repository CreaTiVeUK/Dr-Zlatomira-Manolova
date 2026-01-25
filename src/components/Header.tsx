"use client";

import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Header({ user }: { user: any }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { language, toggleLanguage, dict } = useLanguage();

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
                </div>
            </div>

            {/* Main Header */}
            <header className="header-main">
                <div className="container header-container">
                    <Link href="/" className="logo-section">
                        <div>
                            <div className="logo-text">
                                {dict.header.title}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                {dict.header.subtitle}
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        <Link href="/" style={{ color: 'var(--text-charcoal)' }}>{dict.header.nav.home}</Link>
                        <Link href="/services" style={{ color: 'var(--text-charcoal)' }}>{dict.header.nav.services}</Link>
                        <Link href="/conditions" style={{ color: 'var(--text-charcoal)' }}>{dict.header.nav.conditions}</Link>
                        <Link href="/resources" style={{ color: 'var(--text-charcoal)' }}>{dict.header.nav.resources}</Link>
                        <Link href="/book" style={{ color: 'var(--text-charcoal)', whiteSpace: 'nowrap' }}>{dict.header.nav.book}</Link>
                        <Link href="/contact" style={{ color: 'var(--text-charcoal)' }}>{dict.header.nav.contact}</Link>
                        <div style={{ width: '1px', height: '20px', background: '#ddd', margin: '0 0.5rem' }}></div>
                        <UserMenu user={user} />
                    </nav>

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
                        <div style={{ borderTop: '1px solid #eee', width: '100%' }}></div>
                        <UserMenu user={user} />
                    </nav>
                </div>
            </header>
        </>
    );
}
