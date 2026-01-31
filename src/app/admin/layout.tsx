
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Calendar,
    Users,
    FileText,
    BarChart,
    Settings,
    LogOut
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    const isDark = mounted && theme === 'dark';

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
        { name: "Appointments", icon: Calendar, href: "/admin/appointments" },
        { name: "Patient Record", icon: Users, href: "/admin/users" },
        { name: "Reports", icon: FileText, href: "/admin/reports" },
        { name: "Analytics", icon: BarChart, href: "/admin/analytics" },
    ];

    const sidebarBg = isDark ? '#1F2937' : '#0F4C81'; // gray-800 vs teal
    const mainBg = isDark ? '#111827' : '#f8fafc'; // gray-900 vs soft-gray

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: mainBg, transition: 'background-color 0.3s' }}>
            {/* SIDEBAR */}
            <aside style={{
                width: '260px',
                background: sidebarBg,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                left: 0,
                top: 0,
                zIndex: 1000,
                transition: 'background-color 0.3s'
            }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.05em' }}>MEDITECH</h1>
                </div>

                {/* USER INFO */}
                <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
                        <Image
                            src="/dr-manolova-avatar.png"
                            alt="Dr. Manolova"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Dr. Manolova</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Admin</div>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav style={{ flex: 1, padding: '1rem 0' }}>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            padding: '1rem 2rem',
                                            textDecoration: 'none',
                                            color: 'white',
                                            background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                                            borderLeft: isActive ? '4px solid #3182CE' : '4px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <item.icon size={20} />
                                        <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* BOTTOM ACTIONS */}
                <div style={{ padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Link
                        href="/admin/settings"
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 2rem', color: 'white', opacity: 0.8, textDecoration: 'none' }}
                    >
                        <Settings size={20} />
                        <span style={{ fontSize: '0.9rem' }}>Setting</span>
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 2rem',
                            color: 'white',
                            opacity: 0.8,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        <LogOut size={20} />
                        <span style={{ fontSize: '0.9rem' }}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main style={{
                flex: 1,
                marginLeft: '260px', // Matches sidebar width
                padding: '2rem',
                maxWidth: '100%',
                overflowX: 'hidden'
            }}>
                {children}
            </main>
        </div>
    );
}
