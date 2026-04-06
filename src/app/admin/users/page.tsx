import Link from "next/link";
import { format } from "date-fns";
import { Mic } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";
import { bg, enUS } from "date-fns/locale";

export default async function AdminUserList() {
  const { dict, language } = await getServerDictionary();
  const copy = dict.admin.usersPage;
  const dateLocale = language === "bg" ? bg : enUS;

  const [users, childrenAvailable, documentsAvailable] = await Promise.all([
    prisma.user
      .findMany({
        where: { role: "PATIENT" },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              children: true,
              documents: true,
            },
          },
        },
      })
      .catch((error) => {
        if (isMissingTableError(error)) {
          return prisma.user
            .findMany({
              where: { role: "PATIENT" },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
              },
            })
            .then((fallbackUsers) =>
              fallbackUsers.map((user) => ({
                ...user,
                _count: { children: 0, documents: 0 },
              })),
            );
        }

        throw error;
      }),
    prisma.child.count().then(() => true).catch((error) => {
      if (isMissingTableError(error)) return false;
      throw error;
    }),
    prisma.patientDocument.count().then(() => true).catch((error) => {
      if (isMissingTableError(error)) return false;
      throw error;
    }),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header__copy">
          <span className="page-intro__eyebrow">{copy.eyebrow}</span>
          <h1 className="section-title">{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState
          title={copy.emptyTitle}
          description={copy.emptyDescription}
        />
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>{copy.columns.patient}</th>
                  <th>{copy.columns.joined}</th>
                  <th>{copy.columns.children}</th>
                  <th>{copy.columns.documents}</th>
                  <th>{copy.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name || copy.noName}</strong>
                      <p>{user.email}</p>
                    </td>
                    <td>{format(new Date(user.createdAt), "MMM d, yyyy", { locale: dateLocale })}</td>
                    <td>
                      {childrenAvailable ? (
                        user._count.children > 0 ? (
                          <span className="status-chip status-chip--info">{user._count.children}</span>
                        ) : (
                          <span className="helper-text">-</span>
                        )
                      ) : (
                        <span className="helper-text">-</span>
                      )}
                    </td>
                    <td>
                      {documentsAvailable ? (
                        user._count.documents > 0 ? (
                          <span className="status-chip status-chip--success">{user._count.documents}</span>
                        ) : (
                          <span className="helper-text">-</span>
                        )
                      ) : (
                        <span className="helper-text">-</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group" style={{ justifyContent: "flex-end" }}>
                        <Link href={`/admin/users/${user.id}#session-recorder`} className="btn btn-outline" title={copy.recordSession}>
                          <Mic size={16} />
                          {copy.session}
                        </Link>
                        <Link href={`/admin/users/${user.id}`} className="btn btn-primary">
                          {copy.viewProfile}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
