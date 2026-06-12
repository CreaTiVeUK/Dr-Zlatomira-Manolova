"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ChevronDown } from "lucide-react";

interface UserMenuProps {
    user: {
        name: string;
        email: string;
        role: string;
    } | null;
    /** Flat list of links instead of a dropdown — used inside the mobile nav panel. */
    inline?: boolean;
}

export default function UserMenu({ user, inline = false }: UserMenuProps) {
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { dict } = useLanguage();

    useEffect(() => {
        if (!isOpen) return;
        const onPointerDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen]);

    const handleLogout = async () => {
        startTransition(async () => {
            try {
                await fetch("/api/logout", { method: "POST" });
                await signOut({ callbackUrl: "/login" });
            } catch (err) {
                console.error("Logout failed:", err);
                window.location.href = "/login";
            }
        });
    };

    if (!user) {
        return (
            <Link href="/login" className="btn btn-primary">
                {dict.userMenu.login}
            </Link>
        );
    }

    const accountLinks = [
        { href: "/profile", label: dict.userMenu.profile },
        user.role === "ADMIN"
            ? { href: "/admin/dashboard", label: dict.userMenu.dashboard }
            : { href: "/my-appointments", label: dict.userMenu.appointments },
        ...(user.role !== "ADMIN"
            ? [{ href: "/messages", label: dict.userMenu.messages }]
            : []),
    ];

    if (inline) {
        return (
            <div className="user-menu user-menu--inline">
                {accountLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                        {link.label}
                    </Link>
                ))}
                <button
                    onClick={handleLogout}
                    disabled={isPending}
                    className="user-menu__logout hover-text-primary"
                    type="button"
                >
                    {isPending ? '...' : dict.userMenu.logout}
                </button>
            </div>
        );
    }

    return (
        <div className="user-menu" ref={menuRef}>
            <button
                className="user-menu__profile"
                onClick={() => setIsOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                type="button"
            >
                <div className="user-menu__avatar" aria-hidden="true">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
                <span className="desktop-only user-menu__name">
                    {user.name ? user.name.split(' ')[0] : 'User'}
                </span>
                <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`user-menu__chevron ${isOpen ? 'user-menu__chevron--open' : ''}`}
                />
            </button>

            {isOpen ? (
                <div className="user-menu__dropdown" role="menu">
                    {accountLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            role="menuitem"
                            className="user-menu__item"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <button
                        onClick={handleLogout}
                        disabled={isPending}
                        role="menuitem"
                        className="user-menu__item user-menu__item--logout"
                        type="button"
                    >
                        {isPending ? '...' : dict.userMenu.logout}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
