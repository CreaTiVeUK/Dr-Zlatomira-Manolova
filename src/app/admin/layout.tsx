
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
    LogOut,
    Menu,
    X
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsSidebarOpen(false);
    }, [pathname]);


    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
        { name: "Appointments", icon: Calendar, href: "/admin/appointments" },
        { name: "Patient Record", icon: Users, href: "/admin/users" },
        { name: "Reports", icon: FileText, href: "/admin/reports" },
        { name: "Analytics", icon: BarChart, href: "/admin/analytics" },
    ];


    return (
        <div className="admin-layout">
            {/* MOBILE HEADER */}
            <div className="admin-header-mobile">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', background: 'white' }}>
                        <Image src="/logo.jpg" alt="Logo" fill style={{ objectFit: 'contain', padding: '2px' }} />
                    </div>
                    <span style={{ fontWeight: '800', fontSize: '0.8rem', letterSpacing: '0.05em' }}>ZLATI PEDIATRICS</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* SIDEBAR OVERLAY */}
            <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)} />

            {/* SIDEBAR */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'white' }}>
                        <Image src="/logo.jpg" alt="Logo" fill style={{ objectFit: 'contain', padding: '2px' }} />
                    </div>
                    <h1 style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '0.05em', lineHeight: 1.2 }}>ZLATI<br />PEDIATRICS</h1>
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
                        <span style={{ fontSize: '0.9rem' }}>Settings</span>
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
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}
