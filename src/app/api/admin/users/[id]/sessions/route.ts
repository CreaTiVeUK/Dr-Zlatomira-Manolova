
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/storage";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { createReadStream } from "fs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();

    // 1. Verify Admin Role
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized: Admins only" }, { status: 403 });
    }

    try {
        const { id: patientId } = await params;

        // 2. Parse Form Data
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // 3. Save Audio to Disk
        const { filepath, size } = await saveFile(file, "patient-sessions");

        // 4. Transcription with Whisper
        let transcription = "";
        try {
            const transcriptRes = await openai.audio.transcriptions.create({
                file: createReadStream(filepath),
                model: "whisper-1",
            });
            transcription = transcriptRes.text;
        } catch (err: unknown) {
            console.error("Whisper error:", err);
            return NextResponse.json({ error: "Transcription failed: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
        }

        // 5. Summarization with GPT-4o
        let summary = "";
        try {
            const summaryRes = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional medical assistant. Summarize the following transcript of a pediatric consultation. Provide a clear, structured summary including: Key Concerns, Clinical Observations, and Recommended Actions/Follow-up. Keep it professional and concise. Translate it to Bulgarian as well if the transcript is in Bulgarian, or provide it in the language of the transcript."
                    },
                    {
                        role: "user",
                        content: transcription
                    }
                ],
                temperature: 0.5,
            });
            summary = summaryRes.choices[0]?.message?.content || "";
        } catch (err: unknown) {
            console.error("GPT-4o error:", err);
            return NextResponse.json({ error: "Summarization failed: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
        }

        // 6. Record in Database as a special "Session" document
        const document = await prisma.patientDocument.create({
            data: {
                name: `Session Summary - ${new Date().toLocaleDateString()}`,
                fileUrl: filepath,
                fileType: file.type,
                fileSize: size,
                userId: patientId,
                uploadedById: session.user.id!,
                // @ts-expect-error - Field added to schema but prisma client not regenerated in this environment
                summary: summary,
                transcription: transcription
            }
        });

        return NextResponse.json(document);
    } catch (error: unknown) {
        console.error("Session processing error:", error);
        return NextResponse.json({ error: (error instanceof Error ? error.message : "Internal Server Error") }, { status: 500 });
    }
}
