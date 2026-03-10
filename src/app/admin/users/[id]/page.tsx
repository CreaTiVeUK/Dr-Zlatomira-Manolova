
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";
import Link from "next/link";
import AdminUploadForm from "./AdminUploadForm";
import AudioRecorder from "./AudioRecorder";
import { FileText, Sparkles } from "lucide-react";

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") redirect("/");

    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true
        }
    });

    if (!user) return <div>User not found</div>;

    const [children, documents] = await Promise.all([
        prisma.child.findMany({
            where: { parentId: id },
            orderBy: { createdAt: "desc" }
        }).catch((error) => {
            if (isMissingTableError(error)) {
                return [];
            }

            throw error;
        }),
        prisma.patientDocument.findMany({
            where: { userId: id },
            orderBy: { uploadedAt: "desc" }
        }).catch((error) => {
            if (isMissingTableError(error)) {
                return [];
            }

            throw error;
        })
    ]);

    const childrenAvailable = children.length > 0 || await prisma.child.count().then(() => true).catch((error) => {
        if (isMissingTableError(error)) return false;
        throw error;
    });
    const documentsAvailable = documents.length > 0 || await prisma.patientDocument.count().then(() => true).catch((error) => {
        if (isMissingTableError(error)) return false;
        throw error;
    });

    return (
        <div className="section-padding bg-soft" style={{ minHeight: '100vh' }}>
            <div className="container">
                <div className="mb-8">
                    <Link href="/admin/users" className="text-gray-500 hover:text-gray-800 mb-4 inline-block">← Back to Users</Link>
                    <h1 className="section-title">{user.name}</h1>
                    <div className="text-gray-600">{user.email} • {user.phone || "No phone"}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* CHILDREN INFO */}
                    <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Children</h2>
                        {!childrenAvailable ? <p className="text-gray-500">Children will appear here after the production database migration is applied.</p> : children.length === 0 ? <p className="text-gray-500">No children listed.</p> : (
                            <ul className="space-y-3">
                                {children.map(child => (
                                    <li key={child.id} className="p-3 border rounded bg-gray-50">
                                        <div className="font-bold">{child.name}</div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(child.birthDate).toLocaleDateString()} ({child.gender})
                                        </div>
                                        {child.notes && <div className="text-xs text-gray-500 mt-1">{child.notes}</div>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* DOCUMENTS & UPLOAD */}
                    <div id="upload-section" className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Medical Documents</h2>

                        {!documentsAvailable ? (
                            <div className="mb-8 p-4 bg-amber-50 rounded border border-amber-200 text-sm text-amber-900">
                                Medical documents and AI session logs are temporarily unavailable in production until the latest database migration is applied.
                            </div>
                        ) : (
                            <>
                                <div id="document-upload" className="mb-8 p-4 bg-blue-50 rounded border border-blue-100">
                                    <h3 className="font-bold text-blue-900 mb-2 text-sm">Upload New Document</h3>
                                    <AdminUploadForm userId={user.id} />
                                </div>

                                <div id="session-recorder" className="mb-8">
                                    <AudioRecorder userId={user.id} onSuccess={() => { }} />
                                </div>
                            </>
                        )}

                        <h3 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Existing Files</h3>
                        {!documentsAvailable ? <p className="text-gray-500">Document storage is not available in this environment yet.</p> : documents.length === 0 ? <p className="text-gray-500">No documents yet.</p> : (
                            <ul className="space-y-4">
                                {documents.map(doc => (
                                    <li key={doc.id} className="p-4 border rounded-xl hover:bg-gray-50 transition-colors bg-white">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${doc.summary ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                                                    {doc.summary ? <Sparkles className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{doc.name}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(doc.uploadedAt).toLocaleDateString()} • {(doc.fileSize ? (doc.fileSize / 1024).toFixed(1) + ' KB' : 'Unknown')}
                                                    </div>
                                                </div>
                                            </div>
                                            <a
                                                href={`/api/documents/${doc.id}`}
                                                target="_blank"
                                                className="text-teal-600 text-sm font-bold hover:underline bg-teal-50 px-3 py-1 rounded"
                                            >
                                                Download
                                            </a>
                                        </div>

                                        {doc.summary && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2 mb-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
                                                    <Sparkles className="w-3 h-3" />
                                                    Session Summary
                                                </div>
                                                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed bg-amber-50/30 p-3 rounded-lg border border-amber-100/50">
                                                    {doc.summary}
                                                </div>

                                                {doc.transcription && (
                                                    <details className="mt-3">
                                                        <summary className="text-[10px] text-gray-400 font-bold uppercase cursor-pointer hover:text-gray-600 outline-none">
                                                            View Full Transcription
                                                        </summary>
                                                        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded italic border-l-2 border-gray-200">
                                                            {doc.transcription}
                                                        </div>
                                                    </details>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
