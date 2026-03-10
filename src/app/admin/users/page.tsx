import Link from "next/link";
import { format } from "date-fns";
import { Mic } from "lucide-react";
import { redirect } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";

export default async function AdminUserList() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

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
          <span className="page-intro__eyebrow">Patient records</span>
          <h1 className="section-title">Patient management</h1>
          <p>Review patient accounts, open detailed profiles, and jump straight into session recording when needed.</p>
        </div>
      </div>

      {users.length === 0 ? (
        <EmptyState
          title="No patients found"
          description="New patient registrations will appear here."
        />
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Joined</th>
                  <th>Children</th>
                  <th>Documents</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name || "No name"}</strong>
                      <p>{user.email}</p>
                    </td>
                    <td>{format(new Date(user.createdAt), "MMM d, yyyy")}</td>
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
                        <Link href={`/admin/users/${user.id}#session-recorder`} className="btn btn-outline" title="Record session">
                          <Mic size={16} />
                          Session
                        </Link>
                        <Link href={`/admin/users/${user.id}`} className="btn btn-primary">
                          View profile
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
