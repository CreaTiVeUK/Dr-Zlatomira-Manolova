import Link from "next/link";
import { format } from "date-fns";
import { bg, enUS } from "date-fns/locale";
import { FileText, Filter } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@/lib/audit";

const PAGE_SIZE = 50;

type SearchParams = Promise<{
  action?: string;
  userId?: string;
  page?: string;
}>;

export default async function AdminAuditLogs({ searchParams }: { searchParams: SearchParams }) {
  const { dict, language } = await getServerDictionary();
  const copy = dict.admin.auditLogsPage;
  const dateLocale = language === "bg" ? bg : enUS;

  const { action, userId, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where: { action?: string; userId?: string } = {};
  if (action && Object.values(AuditAction).includes(action as AuditAction)) {
    where.action = action;
  }
  if (userId) where.userId = userId;

  const [logs, total, users] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: PAGE_SIZE,
      skip,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.user.findMany({
      where: { auditLogs: { some: {} } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
      take: 200,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { action, userId, page: String(page), ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v && v !== "") params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/admin/audit-logs?${qs}` : "/admin/audit-logs";
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header__copy">
          <span className="page-intro__eyebrow">{copy.eyebrow}</span>
          <h1 className="section-title">{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>

        <div className="admin-page-actions">
          <div className="admin-toolbar-card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <Filter size={16} color="var(--text-muted)" />
              <form method="get" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "0.75rem" }}>
                  <span className="helper-text">{copy.filterAction}</span>
                  <select name="action" defaultValue={action ?? ""} className="input">
                    <option value="">{copy.filterAll}</option>
                    {Object.values(AuditAction).map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", fontSize: "0.75rem" }}>
                  <span className="helper-text">{copy.filterUser}</span>
                  <select name="userId" defaultValue={userId ?? ""} className="input">
                    <option value="">{copy.filterAll}</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="btn btn-primary">
                  <Filter size={16} />
                  {copy.filterAction}
                </button>
                {(action || userId) && (
                  <Link href="/admin/audit-logs" className="btn btn-outline">
                    {copy.filterReset}
                  </Link>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={copy.emptyTitle}
          description={copy.emptyDescription}
        />
      ) : (
        <>
          <div className="table-card">
            <div className="table-responsive">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>{copy.columns.timestamp}</th>
                    <th>{copy.columns.user}</th>
                    <th>{copy.columns.action}</th>
                    <th>{copy.columns.details}</th>
                    <th>{copy.columns.ip}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss", { locale: dateLocale })}
                      </td>
                      <td>
                        {log.user ? (
                          <Link href={`/admin/users/${log.user.id}`}>
                            <strong>{log.user.name || log.user.email}</strong>
                            {log.user.name && <p className="helper-text">{log.user.email}</p>}
                          </Link>
                        ) : (
                          <span className="helper-text">{copy.noUser}</span>
                        )}
                      </td>
                      <td>
                        <span className="status-chip status-chip--info">{log.action}</span>
                      </td>
                      <td style={{ maxWidth: "24rem", wordBreak: "break-word" }}>
                        {log.details || <span className="helper-text">-</span>}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                        {log.ip || <span className="helper-text">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", gap: "1rem" }}>
            <span className="helper-text">{copy.pageInfo.replace("%s", `${page}/${totalPages}`)}</span>
            <div className="btn-group">
              {page > 1 ? (
                <Link href={buildHref({ page: String(page - 1) })} className="btn btn-outline">
                  {copy.previous}
                </Link>
              ) : (
                <button type="button" className="btn btn-outline" disabled>
                  {copy.previous}
                </button>
              )}
              {page < totalPages ? (
                <Link href={buildHref({ page: String(page + 1) })} className="btn btn-primary">
                  {copy.next}
                </Link>
              ) : (
                <button type="button" className="btn btn-primary" disabled>
                  {copy.next}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
