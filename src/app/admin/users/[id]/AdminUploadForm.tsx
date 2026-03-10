"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUploadForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/users/${userId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setFile(null);
      router.refresh();
      alert("File uploaded successfully.");
    } catch (error) {
      console.error(error);
      alert("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="admin-upload-form">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="admin-file-input"
      />
      {file ? (
        <button type="submit" disabled={uploading} className="btn btn-primary">
          {uploading ? "Uploading..." : "Upload file"}
        </button>
      ) : null}
    </form>
  );
}
