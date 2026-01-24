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
                <div className="container utility-content">
                    <div className="contact-info">
                        <span>📞 +359 88 5557110</span>
                        <span>✉️ zlatomira.manolova@gmail.com</span>
                        <div className="clinical-badge">
                            {dict.header.ageGroup}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {dict.header.utility}
                        </div>
                        {/* Language Switcher */}
                        <button
                            onClick={toggleLanguage}
                            style={{
                                background: 'transparent',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}
                            title={language === 'en' ? "Switch to Bulgarian" : "Switch to English"}
                        >
                            {language === 'en' ? '🇧🇬' : '🇬🇧'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className="header-main">
                <div className="container header-container">
                    <Link href="/" className="logo-section">
                        <Image
                            src="/logo.jpg"
                            alt="Лого"
                            width={55}
                            height={55}
                            style={{ borderRadius: '50%' }}
                        />
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
                    <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
