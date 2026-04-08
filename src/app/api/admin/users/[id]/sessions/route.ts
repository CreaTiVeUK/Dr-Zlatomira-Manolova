import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveEncryptedFile, FileValidationError } from "@/lib/storage";
import { getSummaryClient, getTranscriptionClient } from "@/lib/ai";
import { createAuditLog, AuditAction } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { createReadStream } from "fs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    // Use getSession() — consistent with all other routes; respects inactivity
    // timeout and blocklist checks enforced by the proxy middleware.
    const session = await getSession();
    const ip = (req as { headers: { get: (k: string) => string | null } }).headers.get("x-forwarded-for") ?? "unknown";

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    try {
        const { id: patientId } = await params;

        // Validate patient exists
        const patient = await prisma.user.findUnique({ where: { id: patientId }, select: { id: true } });
        if (!patient) {
            return NextResponse.json({ error: "Patient not found" }, { status: 404 });
        }

        let transcriptionClient: ReturnType<typeof getTranscriptionClient>;
        let summaryClient: ReturnType<typeof getSummaryClient>;
        try {
            transcriptionClient = getTranscriptionClient();
            summaryClient = getSummaryClient();
        } catch {
            return NextResponse.json({ error: "AI services are not configured" }, { status: 503 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Save audio encrypted at rest — medical audio is sensitive
        const { filepath, size } = await saveEncryptedFile(file, "patient-sessions");

        // Transcription with Whisper
        let transcription = "";
        try {
            const transcriptRes = await transcriptionClient.client.audio.transcriptions.create({
                file: createReadStream(filepath),
                model: transcriptionClient.model,
            });
            transcription = transcriptRes.text;
        } catch (err: unknown) {
            logger.error("Whisper transcription failed", err, { patientId });
            return NextResponse.json({ error: "Transcription failed. Please try again." }, { status: 500 });
        }

        // Summarization
        let summary = "";
        try {
            const summaryRes = await summaryClient.client.chat.completions.create({
                model: summaryClient.model,
                messages: [
                    {
                        role: "system",
                        content: "You are a professional medical assistant. Summarize the following transcript of a pediatric consultation. Provide a clear, structured summary including: Key Concerns, Clinical Observations, and Recommended Actions/Follow-up. Keep it professional and concise. Translate it to Bulgarian as well if the transcript is in Bulgarian, or provide it in the language of the transcript.",
                    },
                    { role: "user", content: transcription },
                ],
                temperature: 0.5,
            });
            summary = summaryRes.choices[0]?.message?.content || "";
        } catch (err: unknown) {
            logger.error("AI summarization failed", err, { patientId });
            return NextResponse.json({ error: "Summarization failed. Please try again." }, { status: 500 });
        }

        const document = await prisma.patientDocument.create({
            data: {
                name: `Session Summary - ${new Date().toLocaleDateString()}`,
                fileUrl: filepath,
                fileType: file.type,
                fileSize: size,
                userId: patientId,
                uploadedById: session.user.id,
                summary,
                transcription,
            },
        });

        await createAuditLog(
            session.user.id,
            AuditAction.SESSION_UPLOAD,
            `Admin recorded session (${document.id}) for patient ${patientId}; transcription length: ${transcription.length} chars`,
            ip
        );

        return NextResponse.json(document);
    } catch (error: unknown) {
        if (error instanceof FileValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        logger.error("Session processing error", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
