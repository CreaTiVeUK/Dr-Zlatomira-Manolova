"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AdminUploadForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const copy = language === "bg"
    ? {
        uploadFailed: "Качването не бе успешно",
        uploadSuccess: "Файлът е качен успешно.",
        uploadError: "Грешка при качването на файла.",
        uploading: "Качване...",
        uploadFile: "Качи файл",
      }
    : {
        uploadFailed: "Upload failed",
        uploadSuccess: "File uploaded successfully.",
        uploadError: "Error uploading file.",
        uploading: "Uploading...",
        uploadFile: "Upload file",
      };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/users/${userId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(copy.uploadFailed);

      setFile(null);
      setFeedback({ type: "success", message: copy.uploadSuccess });
      router.refresh();
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: copy.uploadError });
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="admin-upload-form">
      {feedback && (
        <div className={`status-banner status-banner--${feedback.type === "success" ? "success" : "error"}`} style={{ marginBottom: "0.75rem" }}>
          {feedback.message}
        </div>
      )}
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => {
          setFile(e.target.files?.[0] || null);
          setFeedback(null);
        }}
        className="admin-file-input"
      />
      {file ? (
        <button type="submit" disabled={uploading} className="btn btn-primary">
          {uploading ? copy.uploading : copy.uploadFile}
        </button>
      ) : null}
    </form>
  );
}
