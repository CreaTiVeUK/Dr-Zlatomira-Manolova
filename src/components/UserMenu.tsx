"use client";

import { useTransition } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface UserMenuProps {
    user: {
        name: string;
        email: string;
        role: string;
    } | null;
}

export default function UserMenu({ user }: UserMenuProps) {
    const [isPending, startTransition] = useTransition();
    const { dict } = useLanguage();

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

    return (
        <div className="user-menu">
            <Link href="/profile" className="user-menu__profile">
                <div className="user-menu__avatar" aria-hidden="true">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                </div>
                <span className="desktop-only user-menu__name">
                    {user.name ? user.name.split(' ')[0] : 'User'}
                </span>
            </Link>

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
