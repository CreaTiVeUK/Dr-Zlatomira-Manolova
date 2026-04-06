import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, FileText, Filter, MessageSquare, Mic, Plus, Sparkles } from "lucide-react";
import { Prisma } from "@prisma/client";
import EmptyState from "@/components/EmptyState";
import { getServerDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";
import PatientFilter from "./PatientFilter";
import { bg, enUS } from "date-fns/locale";

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
  const { dict, language } = await getServerDictionary();
  const copy = dict.admin.sessionLogsPage;
  const dateLocale = language === "bg" ? bg : enUS;

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
          <strong>{copy.unavailableTitle}</strong>
          <p>{copy.unavailableDescription}</p>
        </div>
      ) : null}

      <div className="admin-page-header">
        <div className="admin-page-header__copy">
          <span className="page-intro__eyebrow">{copy.eyebrow}</span>
          <h1 className="section-title">{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>

        <div className="admin-page-actions">
          <div className="admin-toolbar-card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Filter size={16} color="var(--text-muted)" />
              <PatientFilter patients={patients} selectedUserId={userId} />
            </div>
            <Link href="/admin/users" className="btn btn-primary">
              <Plus size={16} />
              {copy.newSession}
            </Link>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={Mic}
          title={copy.emptyTitle}
          description={copy.emptyDescription}
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
                          {sessionLog.user?.name || copy.unknownPatient}
                        </Link>
                        <span className="helper-text">{copy.recorded} {format(new Date(sessionLog.uploadedAt), "MMM d, h:mm a", { locale: dateLocale })}</span>
                      </div>
                      <p>{sessionLog.name}</p>
                    </div>
                  </div>

                  <div className="admin-record-card__actions">
                    <Link href={`/admin/users/${sessionLog.userId}#upload-section`} className="btn btn-outline">
                      <Plus size={16} />
                      {copy.addDoc}
                    </Link>
                    <Link href={`/admin/users/${sessionLog.userId}`} className="btn btn-primary">
                      {copy.profile}
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className="admin-panel__body">
                  <div className="admin-grid admin-grid--two">
                    <div className="admin-note-box">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
                        <Sparkles size={16} color="var(--accent-gold)" />
                        <strong>{copy.aiSummary}</strong>
                      </div>
                      <p style={{ whiteSpace: "pre-wrap" }}>{sessionLog.summary || copy.noSummary}</p>
                    </div>

                    <div className="admin-note-box">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
                        <MessageSquare size={16} color="var(--primary-teal)" />
                        <strong>{copy.latestPatientNote}</strong>
                      </div>
                      {lastApt ? (
                        <>
                          <p style={{ fontStyle: "italic" }}>&quot;{lastApt.notes || copy.noVisitNotes}&quot;</p>
                          <span className="helper-text">{copy.fromVisitOn} {format(new Date(lastApt.dateTime), "MMM d, yyyy", { locale: dateLocale })}</span>
                        </>
                      ) : (
                        <p className="helper-text">{copy.noRecentNotes}</p>
                      )}
                    </div>
                  </div>

                  {sessionLog.transcription ? (
                    <details style={{ marginTop: "1rem" }}>
                      <summary className="helper-text" style={{ cursor: "pointer" }}>
                        {copy.fullTranscription}
                      </summary>
                      <div className="admin-note-box" style={{ marginTop: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
                          <FileText size={16} color="var(--primary-teal)" />
                          <strong>{copy.transcription}</strong>
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
