import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Mic, Sparkles, FileText, ChevronRight } from "lucide-react";

export default async function AdminSessionsLog() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") redirect("/");

    const sessions = await prisma.patientDocument.findMany({
        where: {
            OR: [
                { transcription: { not: null } },
                { summary: { not: null } }
            ]
        },
        orderBy: { uploadedAt: 'desc' },
        include: {
            user: {
                select: { name: true, email: true }
            }
        }
    });

    return (
        <div className="section-padding bg-soft" style={{ minHeight: '100vh' }}>
            <div className="container">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="section-title">Session Logs</h1>
                        <p className="text-gray-600">Overview of all AI-summarized medical consultations.</p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {sessions.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl text-center border-2 border-dashed border-gray-100">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mic className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="font-bold text-gray-900">No sessions recorded yet</h3>
                            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                                Once you start recording sessions with patients, their summaries and transcriptions will appear here.
                            </p>
                            <Link
                                href="/admin/users"
                                className="inline-block mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors"
                            >
                                Start a Recording
                            </Link>
                        </div>
                    ) : (
                        sessions.map((sessionLog) => (
                            <div
                                key={sessionLog.id}
                                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900 text-lg">{sessionLog.user.name}</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-sm text-gray-500 font-medium">{format(new Date(sessionLog.uploadedAt), "MMM d, h:mm a")}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 line-clamp-2 max-w-3xl leading-relaxed">
                                                {/* @ts-expect-error - summary field exists in DB */}
                                                {sessionLog.summary || "No summary available"}
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/admin/users/${sessionLog.userId}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg font-bold text-sm hover:bg-teal-50 hover:text-teal-700 transition-all group-hover:bg-teal-600 group-hover:text-white"
                                    >
                                        View Full Record
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
