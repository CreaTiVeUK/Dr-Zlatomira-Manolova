"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ThemeToggle from "./ThemeToggle";
import { Menu, X } from "lucide-react";

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

    const navItems = [
        { href: "/", label: dict.header.nav.home },
        { href: "/services", label: dict.header.nav.services },
        { href: "/conditions", label: dict.header.nav.conditions },
        { href: "/resources", label: dict.header.nav.resources },
        { href: "/book", label: dict.header.nav.book },
        { href: "/contact", label: dict.header.nav.contact },
    ];

    const utilityLink = user
        ? user.role === "ADMIN"
            ? { href: "/admin/dashboard", label: dict.userMenu.dashboard }
            : { href: "/my-appointments", label: dict.userMenu.appointments }
        : null;

    return (
        <>
            <div className="header-utility-bar">
                <div className="container header-utility-bar__inner">
                    <div className="contact-info">
                        <a href="tel:+359885557110">
                            <span style={{ opacity: 0.7 }}>TEL:</span> +359 88 5557110
                        </a>
                        <a href="mailto:zlatomira.manolova@gmail.com">
                            <span style={{ opacity: 0.7 }}>EMAIL:</span> zlatomira.manolova@gmail.com
                        </a>
                        <div className="clinical-badge">
                            {dict.header.ageGroup}
                        </div>
                    </div>

                    <div className="utility-controls">
                        <button
                            onClick={toggleLanguage}
                            className="lang-toggle"
                            title={dict.header.switchTitle}
                            type="button"
                        >
                            <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>
                                {language === 'en' ? 'BG' : 'EN'}
                            </span>
                            <span aria-hidden="true">{language === 'en' ? 'Български' : 'English'}</span>
                        </button>
                        <span className="utility-divider" aria-hidden="true" />
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            <header className="header-main">
                <div className="container header-container">
                    <div className="header-logo">
                        <Link href="/" className="logo-section">
                            <div className="logo-text">{dict.header.title}</div>
                            <div className="logo-subtext">
                                {dict.header.subtitle}
                            </div>
                        </Link>
                    </div>

                    <nav className="nav-center" aria-label="Primary navigation">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={pathname === item.href ? "page" : undefined}
                            >
                                {item.label}
                            </Link>
                        ))}
                        {utilityLink ? (
                            <Link href={utilityLink.href} aria-current={pathname === utilityLink.href ? "page" : undefined}>
                                {utilityLink.label}
                            </Link>
                        ) : null}
                    </nav>

                    <div className="header-actions">
                        <UserMenu user={user} />
                    </div>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle Menu"
                        type="button"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    <nav className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
                        {navItems.map((item) => (
                            <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                                {item.label}
                            </Link>
                        ))}
                        {utilityLink ? (
                            <Link href={utilityLink.href} onClick={() => setIsMenuOpen(false)}>
                                {utilityLink.label}
                            </Link>
                        ) : null}
                        <div className="utility-controls" style={{ paddingTop: '0.25rem' }}>
                            <button onClick={toggleLanguage} className="lang-toggle" type="button">
                                {language === 'en' ? 'BG / Български' : 'EN / English'}
                            </button>
                            <ThemeToggle />
                        </div>
                        <UserMenu user={user} />
                    </nav>
                </div>
            </header>
        </>
    );
}
