"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, FileAudio, Mic, Pause, Play, RefreshCw, Sparkles, Square } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AudioRecorderProps {
  userId: string;
}

export default function AudioRecorder({ userId }: AudioRecorderProps) {
  const { dict, language } = useLanguage();
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<"idle" | "recording" | "stopped" | "uploading" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const copy = language === "bg"
    ? {
        micDenied: "Достъпът до микрофона е отказан или възникна грешка.",
        processingFailed: "Обработката не бе успешна",
        processingError: "Възникна грешка по време на обработката.",
        discard: "Изтрий и запиши отново",
        reset: "Нулирай",
      }
    : {
        micDenied: "Microphone access denied or an error occurred.",
        processingFailed: "Processing failed",
        processingError: "An error occurred during processing.",
        discard: "Discard and retake",
        reset: "Reset",
      };

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
        setAudioUrl(URL.createObjectURL(blob));
        setStatus("stopped");
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus("recording");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setStatus("error");
      setErrorMessage(copy.micDenied);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
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
    setStatus("idle");
    setErrorMessage("");
  };

  const handleUploadAndSummarize = async () => {
    if (!audioBlob) return;

    setStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, `session-${Date.now()}.webm`);

      setStatus("processing");
      const res = await fetch(`/api/admin/users/${userId}/sessions`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || copy.processingFailed);
      }

      setStatus("success");
      router.refresh();
      setTimeout(() => resetRecording(), 3000);
    } catch (err: unknown) {
      console.error("Upload/Processing error:", err);
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : copy.processingError);
    }
  };

  return (
    <div className="audio-recorder">
      <div className="audio-recorder__header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
          <span className="icon-badge">
            <FileAudio size={18} />
          </span>
          <div>
            <h3>{dict.admin.sessions.title}</h3>
            <p>{dict.admin.sessions.subtitle}</p>
          </div>
        </div>

        {status === "recording" ? (
          <span className="audio-recorder__status">
            <span className="audio-recorder__pulse" />
            {dict.admin.sessions.recording}
          </span>
        ) : null}
      </div>

      {status === "idle" ? (
        <button onClick={startRecording} className="btn btn-primary" type="button">
          <Mic size={16} />
          {dict.admin.sessions.start}
        </button>
      ) : null}

      {status === "recording" ? (
        <button onClick={stopRecording} className="btn btn-outline" type="button">
          <Square size={16} />
          {dict.admin.sessions.stop}
        </button>
      ) : null}

      {status === "stopped" ? (
        <div className="stack-md">
          <div className="audio-recorder__panel">
            <audio ref={audioRef} src={audioUrl || ""} onEnded={() => setIsPlaying(false)} className="hidden" />
            <div className="audio-recorder__playback">
              <div className="btn-group">
                <button onClick={togglePlayback} className="btn btn-outline" type="button">
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {dict.admin.sessions.ready}
                </button>
              </div>
              <button onClick={resetRecording} className="btn btn-outline" title={copy.discard} type="button">
                <RefreshCw size={16} />
                {copy.reset}
              </button>
            </div>
          </div>

          <button onClick={handleUploadAndSummarize} className="btn btn-primary" type="button">
            <Sparkles size={16} />
            {dict.admin.sessions.summarize}
          </button>
        </div>
      ) : null}

      {status === "uploading" || status === "processing" ? (
        <div className="audio-recorder__loader">
          <div className="audio-recorder__loader-ring" aria-hidden="true" />
          <strong>{status === "uploading" ? dict.admin.sessions.uploading : dict.admin.sessions.processing}</strong>
          <p>{dict.admin.sessions.processingSub}</p>
        </div>
      ) : null}

      {status === "success" ? (
        <div className="audio-recorder__feedback audio-recorder__feedback--success">
          <Check size={22} color="var(--text-success)" />
          <strong>{dict.admin.sessions.success}</strong>
          <p>{dict.admin.sessions.successSub}</p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="audio-recorder__feedback audio-recorder__feedback--error">
          <AlertCircle size={22} color="var(--text-error)" />
          <strong>{dict.admin.sessions.error}</strong>
          <p>{errorMessage}</p>
          <button onClick={resetRecording} className="btn btn-outline" type="button">
            {dict.admin.sessions.tryAgain}
          </button>
        </div>
      ) : null}
    </div>
  );
}
