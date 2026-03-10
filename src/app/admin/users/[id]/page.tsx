import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import AdminUploadForm from "./AdminUploadForm";
import AudioRecorder from "./AudioRecorder";
import EmptyState from "@/components/EmptyState";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true },
  });

  if (!user) {
    return (
      <div className="admin-page">
        <EmptyState title="Patient not found" description="The requested patient record could not be located." />
      </div>
    );
  }

  const [children, documents] = await Promise.all([
    prisma.child.findMany({ where: { parentId: id }, orderBy: { createdAt: "desc" } }).catch((error) => {
      if (isMissingTableError(error)) return [];
      throw error;
    }),
    prisma.patientDocument.findMany({ where: { userId: id }, orderBy: { uploadedAt: "desc" } }).catch((error) => {
      if (isMissingTableError(error)) return [];
      throw error;
    }),
  ]);

  const childrenAvailable =
    children.length > 0 ||
    (await prisma.child.count().then(() => true).catch((error) => {
      if (isMissingTableError(error)) return false;
      throw error;
    }));

  const documentsAvailable =
    documents.length > 0 ||
    (await prisma.patientDocument.count().then(() => true).catch((error) => {
      if (isMissingTableError(error)) return false;
      throw error;
    }));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header__copy">
          <Link href="/admin/users" className="page-intro__eyebrow" style={{ width: "fit-content" }}>
            Back to users
          </Link>
          <h1 className="section-title">{user.name}</h1>
          <p>{user.email} · {user.phone || "No phone number"}</p>
        </div>
      </div>

      <div className="admin-grid admin-grid--two">
        <section className="admin-panel">
          <div className="admin-panel__header">
            <h2>Children</h2>
          </div>
          <div className="admin-panel__body">
            {!childrenAvailable ? (
              <EmptyState title="Children unavailable" description="Child records will appear here after the latest database migration is applied." compact />
            ) : children.length === 0 ? (
              <EmptyState title="No children listed" description="This patient account does not have child profiles yet." compact />
            ) : (
              <div className="admin-record-list">
                {children.map((child) => (
                  <div key={child.id} className="admin-record-card">
                    <strong>{child.name}</strong>
                    <p>{new Date(child.birthDate).toLocaleDateString()} · {child.gender}</p>
                    {child.notes ? <p className="admin-status-note">{child.notes}</p> : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="admin-panel" id="upload-section">
          <div className="admin-panel__header">
            <h2>Medical documents</h2>
          </div>
          <div className="admin-panel__body admin-section-stack">
            {!documentsAvailable ? (
              <div className="status-banner status-banner--warning">
                <strong>Medical documents are temporarily unavailable.</strong>
                <p>Apply the latest production database migration to restore documents and AI session logs.</p>
              </div>
            ) : (
              <>
                <div className="surface-card surface-card--accent">
                  <h3 style={{ marginBottom: "0.65rem" }}>Upload new document</h3>
                  <AdminUploadForm userId={user.id} />
                </div>

                <div id="session-recorder" className="surface-card">
                  <AudioRecorder userId={user.id} />
                </div>
              </>
            )}

            <div className="stack-md">
              <h3>Existing files</h3>
              {!documentsAvailable ? (
                <EmptyState title="Documents unavailable" description="Document storage is not available in this environment yet." compact />
              ) : documents.length === 0 ? (
                <EmptyState title="No documents yet" description="Upload reports or use session recording to generate new entries." compact />
              ) : (
                <div className="admin-record-list">
                  {documents.map((doc) => (
                    <div key={doc.id} className="admin-record-card">
                      <div className="admin-record-card__header">
                        <div style={{ display: "grid", gap: "0.35rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <span className="icon-badge">
                              {doc.summary ? <Sparkles size={18} /> : <FileText size={18} />}
                            </span>
                            <div>
                              <strong>{doc.name}</strong>
                              <p>{new Date(doc.uploadedAt).toLocaleDateString()} · {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : "Unknown size"}</p>
                            </div>
                          </div>
                        </div>
                        <div className="admin-record-card__actions">
                          <a href={`/api/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                            Download
                          </a>
                        </div>
                      </div>

                      {doc.summary ? (
                        <div className="stack-md" style={{ marginTop: "1rem" }}>
                          <div className="admin-note-box">
                            <strong style={{ display: "block", marginBottom: "0.45rem" }}>Session summary</strong>
                            <p style={{ whiteSpace: "pre-wrap" }}>{doc.summary}</p>
                          </div>

                          {doc.transcription ? (
                            <details>
                              <summary className="helper-text" style={{ cursor: "pointer" }}>View full transcription</summary>
                              <div className="admin-note-box" style={{ marginTop: "0.75rem" }}>
                                <p style={{ whiteSpace: "pre-wrap" }}>{doc.transcription}</p>
                              </div>
                            </details>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
