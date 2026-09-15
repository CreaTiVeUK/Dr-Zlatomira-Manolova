"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, Phone } from "lucide-react";

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
    const menuRef = useRef<HTMLElement>(null);
    const menuBtnRef = useRef<HTMLButtonElement>(null);
    const swallowNextClick = useRef(false);

    // Standard disclosure behaviour: Escape closes and returns focus to the
    // button; a pointer-down outside closes (captured, so the tap does not
    // also activate whatever is underneath); focus moves into the panel.
    useEffect(() => {
        if (!isMenuOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsMenuOpen(false);
                menuBtnRef.current?.focus();
            }
        };
        const onPointerDown = (e: PointerEvent) => {
            const t = e.target as Node;
            if (!menuRef.current?.contains(t) && !menuBtnRef.current?.contains(t)) {
                // The click that follows this pointer-down must not reach the
                // page underneath; the persistent listener below swallows it.
                swallowNextClick.current = true;
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("pointerdown", onPointerDown, true);
        menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("pointerdown", onPointerDown, true);
        };
    }, [isMenuOpen]);

    // Registered once, independent of the menu's open/closed effect: closing
    // the menu re-runs that effect's cleanup before the click event fires, so
    // a listener owned by it would be gone by the time it was needed.
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!swallowNextClick.current) return;
            swallowNextClick.current = false;
            e.preventDefault();
            e.stopPropagation();
        };
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, []);
    const { language, toggleLanguage, dict } = useLanguage();
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) return null;

    const navItems = [
        { href: "/", label: dict.header.nav.home },
        { href: "/services", label: dict.header.nav.services },
        { href: "/conditions", label: dict.header.nav.conditions },
        { href: "/resources", label: dict.header.nav.resources },
        // Anonymous visitors cannot use /book (it redirects to login); send them to
        // the page with the phone number and the form. Account holders get the tool.
        { href: user ? "/book" : "/contact", label: dict.header.nav.book },
        { href: "/contact", label: dict.header.nav.contact },
    ];

    return (
        <>
            <div className="header-utility-bar">
                <div className="container header-utility-bar__inner">
                    <div className="contact-info">
                        <a href="tel:+359885557110">
                            <span style={{ opacity: 0.7 }}>{dict.header.contact.tel}:</span> +359 88 5557110
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
                                key={item.label}
                                href={item.href}
                                aria-current={pathname === item.href ? "page" : undefined}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="header-actions">
                        {/* On a phone the one action a parent needs is to call. Login lives
                            in the menu; it serves returning account-holders only. */}
                        <a href="tel:+359885557110" className="btn btn-primary header-call">
                            <Phone size={16} aria-hidden="true" />
                            {language === "bg" ? "Обади се" : "Call"}
                        </a>
                        <div className="header-user">
                            <UserMenu user={user} />
                        </div>
                    </div>

                    <button
                        ref={menuBtnRef}
                        className="mobile-menu-btn"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-controls="mobile-primary-nav"
                        aria-expanded={isMenuOpen}
                        aria-label={isMenuOpen ? dict.header.closeMenu : dict.header.openMenu}
                        type="button"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* inert removes the closed panel from the tab order and the accessibility tree. */}
                    <nav ref={menuRef} id="mobile-primary-nav" className={`mobile-nav ${isMenuOpen ? 'open' : ''}`} aria-label="Mobile navigation" inert={!isMenuOpen}>
                        {navItems.map((item) => (
                            <Link key={item.label} href={item.href} onClick={() => setIsMenuOpen(false)}>
                                {item.label}
                            </Link>
                        ))}
                        <div className="utility-controls" style={{ paddingTop: '0.25rem' }}>
                            <button onClick={toggleLanguage} className="lang-toggle" type="button">
                                {language === 'en' ? 'BG / Български' : 'EN / English'}
                            </button>
                            <ThemeToggle />
                        </div>
                        <UserMenu user={user} inline />
                    </nav>
                </div>
            </header>
        </>
    );
}
