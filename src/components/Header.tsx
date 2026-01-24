"use client";

import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";
import { useState } from "react";

export default function Header({ user }: { user: any }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            {/* Utility Bar */}
            <div className="header-utility-bar">
                <div className="container utility-content">
                    <div className="contact-info">
                        <span>📞 +359 88 5557110</span>
                        <span>✉️ zlatomira.manolova@gmail.com</span>
                        <div className="clinical-badge">
                            Възраст 0-18 години
                        </div>
                    </div>
                    <div style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Специализирана педиатрична помощ в Пловдив
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
                                Д-р Златомира Манолова
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                ПЕДИАТЪР СПЕЦИАЛИСТ
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="nav-desktop">
                        <Link href="/" style={{ color: 'var(--text-charcoal)' }}>НАЧАЛО</Link>
                        <Link href="/services" style={{ color: 'var(--text-charcoal)' }}>УСЛУГИ</Link>
                        <Link href="/conditions" style={{ color: 'var(--text-charcoal)' }}>ЗАБОЛЯВАНИЯ</Link>
                        <Link href="/resources" style={{ color: 'var(--text-charcoal)' }}>РЕСУРСИ</Link>
                        <Link href="/book" style={{ color: 'var(--text-charcoal)', whiteSpace: 'nowrap' }}>ЗАПАЗЕТЕ ЧАС</Link>
                        <Link href="/contact" style={{ color: 'var(--text-charcoal)' }}>КОНТАКТИ</Link>
                        <div style={{ width: '1px', height: '20px', background: '#ddd', margin: '0 0.5rem' }}></div>
                        <UserMenu user={user} />
                    </nav>

                    {/* Mobile Menu Button */}
                    <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? '✕' : '☰'}
                    </button>

                    {/* Mobile Navigation */}
                    <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
                        <Link href="/" onClick={() => setIsMenuOpen(false)}>НАЧАЛО</Link>
                        <Link href="/services" onClick={() => setIsMenuOpen(false)}>УСЛУГИ</Link>
                        <Link href="/conditions" onClick={() => setIsMenuOpen(false)}>ЗАБОЛЯВАНИЯ</Link>
                        <Link href="/resources" onClick={() => setIsMenuOpen(false)}>РЕСУРСИ</Link>
                        <Link href="/book" onClick={() => setIsMenuOpen(false)}>ЗАПАЗЕТЕ ЧАС</Link>
                        <Link href="/contact" onClick={() => setIsMenuOpen(false)}>КОНТАКТИ</Link>
                        <div style={{ borderTop: '1px solid #eee', width: '100%' }}></div>
                        <UserMenu user={user} />
                    </nav>
                </div>
            </header>
        </>
    );
}
