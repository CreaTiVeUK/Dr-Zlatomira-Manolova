"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DeleteDocumentButton({
  docId,
  userId,
}: {
  docId: string;
  userId: string;
}) {
  const router = useRouter();
  const { dict } = useLanguage();
  const copy = dict.admin.userDetailPage;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(copy.deleteConfirm)) return;
    setDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/users/${userId}/documents?docId=${docId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Delete failed.");
      }
    } catch {
      alert("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="btn btn-outline"
      style={{ color: "#be123c", borderColor: "#fecdd3" }}
      title={copy.delete}
    >
      <Trash2 size={15} />
      {copy.delete}
    </button>
  );
}
