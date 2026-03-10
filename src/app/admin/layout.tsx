"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Calendar, LayoutDashboard, LogOut, Menu, Mic, Users, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { dict } = useLanguage();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: dict.admin.sidebar.dashboard, icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: dict.admin.sidebar.appointments, icon: Calendar, href: "/admin/appointments" },
    { name: dict.admin.sidebar.patientRecord, icon: Users, href: "/admin/users" },
    { name: dict.admin.sidebar.sessions, icon: Mic, href: "/admin/sessions" },
  ];

  return (
    <div className="admin-layout">
      <div className="admin-header-mobile">
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <div style={{ position: "relative", width: "34px", height: "34px", borderRadius: "50%", overflow: "hidden", background: "white" }}>
            <Image src="/logo.jpg" alt="Logo" fill style={{ objectFit: "contain", padding: "3px" }} />
          </div>
          <strong style={{ fontFamily: "var(--font-heading)", fontSize: "0.9rem", letterSpacing: "0.05em" }}>
            {dict.header.title}
          </strong>
        </div>
        <button onClick={() => setIsSidebarOpen((open) => !open)} style={{ background: "none", border: 0, color: "white" }} type="button">
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`} onClick={() => setIsSidebarOpen(false)} />

      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar__brand">
          <div style={{ position: "relative", width: "42px", height: "42px", borderRadius: "50%", overflow: "hidden", background: "white" }}>
            <Image src="/logo.jpg" alt="Logo" fill style={{ objectFit: "contain", padding: "4px" }} />
          </div>
          <div className="admin-sidebar__brand-copy">
            <strong style={{ fontFamily: "var(--font-heading)", fontSize: "1rem" }}>{dict.header.title}</strong>
            <span>{dict.admin.sidebar.roleAdmin}</span>
          </div>
        </div>

        <div className="admin-sidebar__user">
          <div style={{ position: "relative", width: "48px", height: "48px", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.14)" }}>
            <Image src="/dr-manolova-avatar.png" alt="Dr. Manolova" fill style={{ objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}>Dr. Manolova</div>
            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.72)" }}>{dict.admin.sidebar.roleAdmin}</div>
          </div>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__footer">
          <button onClick={() => signOut({ callbackUrl: "/" })} className="admin-sidebar__logout" type="button">
            <LogOut size={18} />
            <span>{dict.admin.sidebar.logout}</span>
          </button>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
