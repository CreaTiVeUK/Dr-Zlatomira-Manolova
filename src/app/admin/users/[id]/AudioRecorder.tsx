
"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RefreshCw, Check, AlertCircle, FileAudio, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AudioRecorderProps {
    userId: string;
    onSuccess: () => void;
}

export default function AudioRecorder({ userId, onSuccess }: AudioRecorderProps) {
    const { dict } = useLanguage();
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [status, setStatus] = useState<'idle' | 'recording' | 'stopped' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                setStatus('stopped');
            };

            mediaRecorder.start();
            setIsRecording(true);
            setStatus('recording');
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setStatus('error');
            setErrorMessage("Microphone access denied or error occurred.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const togglePlayback = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const resetRecording = () => {
        setAudioBlob(null);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
        setStatus('idle');
        setErrorMessage("");
    };

    const handleUploadAndSummarize = async () => {
        if (!audioBlob) return;

        setStatus('uploading');
        try {
            const formData = new FormData();
            formData.append("file", audioBlob, `session-${Date.now()}.webm`);

            setStatus('processing');
            const res = await fetch(`/api/admin/users/${userId}/sessions`, {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Processing failed");
            }

            setStatus('success');
            onSuccess();
            setTimeout(() => resetRecording(), 3000);
        } catch (err: unknown) {
            console.error("Upload/Processing error:", err);
            setStatus('error');
            setErrorMessage(err instanceof Error ? err.message : "An error occurred during processing.");
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-teal-50 rounded-lg">
                        <FileAudio className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{dict.admin.sessions.title}</h3>
                        <p className="text-xs text-gray-500">{dict.admin.sessions.subtitle}</p>
                    </div>
                </div>
                {status === 'recording' && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full animate-pulse border border-red-100">
                        <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        <span className="text-xs font-bold uppercase tracking-wider">{dict.admin.sessions.recording}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4">
                {status === 'idle' && (
                    <button
                        onClick={startRecording}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-100"
                    >
                        <Mic className="w-5 h-5" />
                        {dict.admin.sessions.start}
                    </button>
                )}

                {status === 'recording' && (
                    <button
                        onClick={stopRecording}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                    >
                        <Square className="w-5 h-5" />
                        {dict.admin.sessions.stop}
                    </button>
                )}

                {status === 'stopped' && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <audio
                                ref={audioRef}
                                src={audioUrl || ""}
                                onEnded={() => setIsPlaying(false)}
                                className="hidden"
                            />
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={togglePlayback}
                                        className="p-3 bg-white rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                                    </button>
                                    <span className="text-sm font-medium text-gray-700">{dict.admin.sessions.ready}</span>
                                </div>
                                <button
                                    onClick={resetRecording}
                                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Discard and retake"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleUploadAndSummarize}
                            className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-bold hover:from-teal-700 hover:to-teal-600 transition-all shadow-lg shadow-teal-100"
                        >
                            <Sparkles className="w-5 h-5" />
                            {dict.admin.sessions.summarize}
                        </button>
                    </div>
                )}

                {(status === 'uploading' || status === 'processing') && (
                    <div className="flex flex-col items-center justify-center p-8 bg-teal-50 rounded-xl border border-teal-100">
                        <div className="relative mb-4">
                            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-teal-600" />
                        </div>
                        <p className="font-bold text-teal-900">{status === 'uploading' ? dict.admin.sessions.uploading : dict.admin.sessions.processing}</p>
                        <p className="text-xs text-teal-600 mt-1">{dict.admin.sessions.processingSub}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-xl border border-green-100">
                        <div className="p-3 bg-green-100 rounded-full mb-3">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="font-bold text-green-900">{dict.admin.sessions.success}</p>
                        <p className="text-xs text-green-600 mt-1">{dict.admin.sessions.successSub}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-xl border border-red-100">
                        <AlertCircle className="w-8 h-8 text-red-600 mb-3" />
                        <p className="font-bold text-red-900">{dict.admin.sessions.error}</p>
                        <p className="text-xs text-red-600 text-center mt-1">{errorMessage}</p>
                        <button
                            onClick={resetRecording}
                            className="mt-4 text-sm font-bold text-red-700 hover:underline"
                        >
                            {dict.admin.sessions.tryAgain}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
