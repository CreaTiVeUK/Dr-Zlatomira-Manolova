import AdminSidebarClient from "./AdminSidebarClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout">
      <AdminSidebarClient />
      <main className="admin-main">{children}</main>
    </div>
  );
}
