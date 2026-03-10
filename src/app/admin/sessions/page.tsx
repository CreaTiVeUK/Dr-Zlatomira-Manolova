import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { isMissingTableError } from "@/lib/prisma-errors";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Mic, Sparkles, FileText, ChevronRight, Filter, Plus, MessageSquare } from "lucide-react";
import PatientFilter from "./PatientFilter";

const sessionLogArgs = Prisma.validator<Prisma.PatientDocumentDefaultArgs>()({
    include: {
        user: {
            include: {
                appointments: {
                    orderBy: { dateTime: "desc" },
                    take: 1,
                    select: { notes: true, dateTime: true }
                }
            }
        }
    }
});

type SessionLog = Prisma.PatientDocumentGetPayload<typeof sessionLogArgs>;

export default async function AdminSessionsLog({ searchParams }: { searchParams: Promise<{ userId?: string }> }) {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") redirect("/");

    const { userId } = await searchParams;

    // Fetch all patients for the filter
    const patients = await prisma.user.findMany({
        where: { role: 'PATIENT' },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    });

    const { sessions, sessionsUnavailable } = await prisma.patientDocument.findMany({
        where: {
            AND: [
                {
                    OR: [
                        { transcription: { not: null } },
                        { summary: { not: null } }
                    ]
                },
                userId ? { userId } : {}
            ]
        },
        orderBy: { uploadedAt: 'desc' },
        ...sessionLogArgs
    }).then((result) => ({
        sessions: result,
        sessionsUnavailable: false
    })).catch((error) => {
        if (isMissingTableError(error)) {
            return {
                sessions: [] as SessionLog[],
                sessionsUnavailable: true
            };
        }

        throw error;
    });

    return (
        <div className="section-padding bg-soft" style={{ minHeight: '100vh' }}>
            <div className="container">
                {sessionsUnavailable && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
                        Session logs are temporarily unavailable because the production database has not been migrated to the latest schema yet.
                    </div>
                )}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="section-title">Session Logs & Feedback</h1>
                        <p className="text-gray-600">Review AI summaries and patient feedback from bookings.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <PatientFilter patients={patients} selectedUserId={userId} />
                        </div>
                        <Link
                            href="/admin/users"
                            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-bold text-sm hover:bg-teal-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Session
                        </Link>
                    </div>
                </div>

                <div className="grid gap-6">
                    {sessions.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl text-center border-2 border-dashed border-gray-100">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mic className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="font-bold text-gray-900">No sessions match your criteria</h3>
                            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                                Try adjusting your filter or start a new recording with a patient.
                            </p>
                        </div>
                    ) : (
                        sessions.map((sessionLog: SessionLog) => {
                            const lastApt = sessionLog.user?.appointments?.[0];
                            return (
                                <div
                                    key={sessionLog.id}
                                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                                >
                                    <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                                                    <Sparkles className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Link href={`/admin/users/${sessionLog.userId}`} className="font-bold text-gray-900 text-lg hover:underline hover:text-teal-600">
                                                            {sessionLog.user?.name || "Unknown Patient"}
                                                        </Link>
                                                        <span className="text-gray-400">•</span>
                                                        <span className="text-sm text-gray-500 font-medium">Recorded {format(new Date(sessionLog.uploadedAt), "MMM d, h:mm a")}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1.5">
                                                            <FileText className="w-3.5 h-3.5" />
                                                            {sessionLog.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/users/${sessionLog.userId}#upload-section`}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold text-sm hover:bg-gray-50 transition-all"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Doc
                                                </Link>
                                                <Link
                                                    href={`/admin/users/${sessionLog.userId}`}
                                                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-bold text-sm hover:bg-teal-700 transition-all"
                                                >
                                                    Profile
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                                                <Sparkles className="w-3.5 h-3.5" />
                                                AI Session Summary
                                            </div>
                                            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed bg-amber-50/30 p-4 rounded-xl border border-amber-100/50">
                                                {sessionLog.summary || "No summary available"}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                                                <MessageSquare className="w-3.5 h-3.5" />
                                                Latest Patient Note / Feedback
                                            </div>
                                            {lastApt ? (
                                                <div className="p-4 bg-blue-50/30 rounded-xl border border-blue-100/50">
                                                    <p className="text-sm text-gray-700 leading-relaxed italic">
                                                        &quot;{lastApt.notes || "No notes provided for this visit."}&quot;
                                                    </p>
                                                    <div className="mt-3 text-[10px] text-blue-500 font-bold uppercase">
                                                        From Visit on {format(new Date(lastApt.dateTime), "MMM d, yyyy")}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-400 italic">
                                                    No recent appointment notes found for this patient.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
