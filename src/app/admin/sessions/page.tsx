import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, FileText, Filter, MessageSquare, Mic, Plus, Sparkles } from "lucide-react";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";
import PatientFilter from "./PatientFilter";

const sessionLogArgs = Prisma.validator<Prisma.PatientDocumentDefaultArgs>()({
  include: {
    user: {
      include: {
        appointments: {
          orderBy: { dateTime: "desc" },
          take: 1,
          select: { notes: true, dateTime: true },
        },
      },
    },
  },
});

type SessionLog = Prisma.PatientDocumentGetPayload<typeof sessionLogArgs>;

export default async function AdminSessionsLog({ searchParams }: { searchParams: Promise<{ userId?: string }> }) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const { userId } = await searchParams;

  const patients = await prisma.user.findMany({
    where: { role: "PATIENT" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const { sessions, sessionsUnavailable } = await prisma.patientDocument
    .findMany({
      where: {
        AND: [
          {
            OR: [{ transcription: { not: null } }, { summary: { not: null } }],
          },
          userId ? { userId } : {},
        ],
      },
      orderBy: { uploadedAt: "desc" },
      ...sessionLogArgs,
    })
    .then((result) => ({ sessions: result, sessionsUnavailable: false }))
    .catch((error) => {
      if (isMissingTableError(error)) {
        return { sessions: [] as SessionLog[], sessionsUnavailable: true };
      }
      throw error;
    });

  return (
    <div className="admin-page">
      {sessionsUnavailable ? (
        <div className="status-banner status-banner--warning">
          <strong>Session logs are temporarily unavailable.</strong>
          <p>The production database has not been migrated to the latest schema yet.</p>
        </div>
      ) : null}

      <div className="admin-page-header">
        <div className="admin-page-header__copy">
          <span className="page-intro__eyebrow">Session logs</span>
          <h1 className="section-title">Session logs &amp; feedback</h1>
          <p>Review AI summaries, revisit uploaded recordings, and jump directly into the relevant patient profile.</p>
        </div>

        <div className="admin-page-actions">
          <div className="admin-toolbar-card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Filter size={16} color="var(--text-muted)" />
              <PatientFilter patients={patients} selectedUserId={userId} />
            </div>
            <Link href="/admin/users" className="btn btn-primary">
              <Plus size={16} />
              New session
            </Link>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Mic}
          title="No sessions match your criteria"
          description="Try adjusting the filter or start a new recording from a patient profile."
        />
      ) : (
        <div className="admin-section-stack">
          {sessions.map((sessionLog) => {
            const lastApt = sessionLog.user?.appointments?.[0];

            return (
              <article key={sessionLog.id} className="admin-panel">
                <div className="admin-panel__header">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.9rem" }}>
                    <span className="icon-badge">
                      <Sparkles size={18} />
                    </span>
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                        <Link href={`/admin/users/${sessionLog.userId}`} style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}>
                          {sessionLog.user?.name || "Unknown patient"}
                        </Link>
                        <span className="helper-text">Recorded {format(new Date(sessionLog.uploadedAt), "MMM d, h:mm a")}</span>
                      </div>
                      <p>{sessionLog.name}</p>
                    </div>
                  </div>

                  <div className="admin-record-card__actions">
                    <Link href={`/admin/users/${sessionLog.userId}#upload-section`} className="btn btn-outline">
                      <Plus size={16} />
                      Add doc
                    </Link>
                    <Link href={`/admin/users/${sessionLog.userId}`} className="btn btn-primary">
                      Profile
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className="admin-panel__body">
                  <div className="admin-grid admin-grid--two">
                    <div className="admin-note-box">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
                        <Sparkles size={16} color="var(--accent-gold)" />
                        <strong>AI session summary</strong>
                      </div>
                      <p style={{ whiteSpace: "pre-wrap" }}>{sessionLog.summary || "No summary available."}</p>
                    </div>

                    <div className="admin-note-box">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
                        <MessageSquare size={16} color="var(--primary-teal)" />
                        <strong>Latest patient note</strong>
                      </div>
                      {lastApt ? (
                        <>
                          <p style={{ fontStyle: "italic" }}>&quot;{lastApt.notes || "No notes provided for this visit."}&quot;</p>
                          <span className="helper-text">From visit on {format(new Date(lastApt.dateTime), "MMM d, yyyy")}</span>
                        </>
                      ) : (
                        <p className="helper-text">No recent appointment notes found for this patient.</p>
                      )}
                    </div>
                  </div>

                  {sessionLog.transcription ? (
                    <details style={{ marginTop: "1rem" }}>
                      <summary className="helper-text" style={{ cursor: "pointer" }}>
                        View full transcription
                      </summary>
                      <div className="admin-note-box" style={{ marginTop: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
                          <FileText size={16} color="var(--primary-teal)" />
                          <strong>Transcription</strong>
                        </div>
                        <p style={{ whiteSpace: "pre-wrap" }}>{sessionLog.transcription}</p>
                      </div>
                    </details>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
