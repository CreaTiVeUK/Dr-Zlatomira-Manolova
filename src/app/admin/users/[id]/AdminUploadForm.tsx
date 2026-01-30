
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
                body: formData
            });

            if (!res.ok) throw new Error("Upload failed");

            // Refresh UI
            setFile(null);
            router.refresh();
            alert("File uploaded successfully!");
        } catch (error) {
            console.error(error);
            alert("Error uploading file");
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleUpload}>
            <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 mb-2 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
            {file && (
                <button
                    type="submit"
                    disabled={uploading}
                    className="bg-teal-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-teal-700 disabled:opacity-50"
                >
                    {uploading ? "Uploading..." : "Upload File"}
                </button>
            )}
        </form>
    );
}
