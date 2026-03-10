"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/high-res.css";
import { Baby, FileText, Trash2, UserRound } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Child {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  notes?: string;
}

interface Document {
  id: string;
  name: string;
  uploadedAt: string;
  fileSize: number;
  fileType: string;
}

export default function ProfilePage() {
  const { status } = useSession();
  const { dict, language } = useLanguage();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [childForm, setChildForm] = useState({ name: "", birthDate: "", gender: "M", notes: "" });
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
      return;
    }

    if (status === "authenticated") {
      Promise.all([
        fetch("/api/user/profile").then((res) => res.json()),
        fetch("/api/user/children").then((res) => res.json()),
        fetch("/api/user/documents").then((res) => res.json()),
      ])
        .then(([profile, childrenData, docsData]) => {
          if (profile.error) throw new Error(profile.error);

          setFormData({
            name: profile.name || "",
            email: profile.email || "",
            phone: profile.phone || "",
          });

          if (Array.isArray(childrenData)) setChildren(childrenData);
          if (Array.isArray(docsData)) setDocuments(docsData);
        })
        .catch((err) => {
          console.error(err);
          setMessage({
            text: dict.booking.error || "Error loading profile",
            type: "error",
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [dict.booking.error, router, status]);

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(childForm),
      });

      const newChild = await res.json();
      if (!res.ok) throw new Error(newChild.error);

      setChildren([newChild, ...children]);
      setIsAddingChild(false);
      setChildForm({ name: "", birthDate: "", gender: "M", notes: "" });
      setMessage({ text: language === "bg" ? "Профилът на детето е добавен." : "Child added successfully.", type: "success" });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Error adding child", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChild = async (id: string) => {
    if (!confirm(language === "bg" ? "Сигурни ли сте, че искате да премахнете този профил?" : "Are you sure you want to remove this child profile?")) return;
    try {
      const res = await fetch(`/api/user/children?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setChildren(children.filter((child) => child.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting child");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, phone: formData.phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setMessage({
        text: language === "bg" ? "Профилът е обновен успешно." : "Profile updated successfully.",
        type: "success",
      });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "An unexpected error occurred", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="page-shell page-shell--soft">
        <div className="container state-shell">
          <div className="state-shell__panel">
            <div className="spinner" aria-hidden="true" />
            <p>{language === "bg" ? "Подготвяме профила Ви..." : "Preparing your profile..."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell page-shell--soft">
      <div className="container profile-layout">
        <div className="profile-stack">
          <div className="profile-card">
            <PageIntro
              align="left"
              eyebrow={language === "bg" ? "Моят профил" : "My profile"}
              title={language === "bg" ? "Профил и контактни данни" : "Profile and contact details"}
              subtitle={language === "bg" ? "Поддържайте актуални личните си данни и предпочитания за връзка." : "Keep your personal details and contact preferences up to date."}
              className="page-intro--left"
            />

            {message ? (
              <div className={`status-banner ${message.type === "success" ? "status-banner--success" : "status-banner--error"}`}>
                <strong>{message.text}</strong>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="field">
                <label htmlFor="profile-email">{dict.auth.register.email}</label>
                <input id="profile-email" type="email" value={formData.email} disabled />
                <span className="helper-text">{language === "bg" ? "Имейл адресът не може да се редактира." : "Email cannot be changed."}</span>
              </div>

              <div className="field">
                <label htmlFor="profile-name">{dict.auth.register.name}</label>
                <input id="profile-name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div className="field">
                <label>{dict.auth.register.phone}</label>
                <PhoneInput
                  country="bg"
                  value={formData.phone}
                  onChange={(phone) => setFormData({ ...formData, phone })}
                  enableSearch
                  containerStyle={{ width: "100%" }}
                  inputStyle={{ width: "100%" }}
                  buttonStyle={{}}
                  dropdownStyle={{ width: "320px" }}
                />
              </div>

              <button type="submit" disabled={isSaving} className="btn btn-primary">
                {isSaving ? (language === "bg" ? "Запазване..." : "Saving...") : (language === "bg" ? "Запази промените" : "Save changes")}
              </button>
            </form>
          </div>

          <div className="profile-card">
            <div className="page-intro page-intro--left" style={{ marginBottom: "1.5rem" }}>
              <span className="page-intro__eyebrow"><Baby size={14} /> {language === "bg" ? "Детски профили" : "Children profiles"}</span>
              <div className="page-intro__copy">
                <h2 style={{ fontSize: "1.7rem" }}>{language === "bg" ? "Деца и основна информация" : "Children and basic details"}</h2>
                <p className="page-intro__subtitle">{language === "bg" ? "Добавете профили на децата, за да ускорите записването и клиничната подготовка." : "Add child profiles to streamline booking and clinical prep."}</p>
              </div>
            </div>

            <div className="btn-group" style={{ marginBottom: "1rem" }}>
              <button type="button" onClick={() => setIsAddingChild(!isAddingChild)} className="btn btn-outline">
                {isAddingChild ? (language === "bg" ? "Откажи" : "Cancel") : (language === "bg" ? "Добави дете" : "Add child")}
              </button>
            </div>

            {isAddingChild ? (
              <div className="surface-card surface-card--accent" style={{ marginBottom: "1.25rem" }}>
                <form onSubmit={handleAddChild} className="form-grid">
                  <div className="field">
                    <label htmlFor="child-name">{language === "bg" ? "Име" : "Full name"}</label>
                    <input id="child-name" type="text" required value={childForm.name} onChange={(e) => setChildForm({ ...childForm, name: e.target.value })} />
                  </div>
                  <div className="form-grid form-grid--two">
                    <div className="field">
                      <label htmlFor="child-birthdate">{language === "bg" ? "Дата на раждане" : "Date of birth"}</label>
                      <input id="child-birthdate" type="date" required value={childForm.birthDate} onChange={(e) => setChildForm({ ...childForm, birthDate: e.target.value })} />
                    </div>
                    <div className="field">
                      <label htmlFor="child-gender">{language === "bg" ? "Пол" : "Gender"}</label>
                      <select id="child-gender" value={childForm.gender} onChange={(e) => setChildForm({ ...childForm, gender: e.target.value })}>
                        <option value="M">{language === "bg" ? "Момче" : "Boy"}</option>
                        <option value="F">{language === "bg" ? "Момиче" : "Girl"}</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? (language === "bg" ? "Запазване..." : "Saving...") : (language === "bg" ? "Запази профила" : "Save child profile")}
                  </button>
                </form>
              </div>
            ) : null}

            {children.length === 0 ? (
              <EmptyState
                icon={Baby}
                title={language === "bg" ? "Все още няма добавени деца." : "No child profiles yet."}
                description={language === "bg" ? "Създайте профил за по-бързо записване и по-добра организация на документацията." : "Create a profile for faster booking and better document organization."}
                compact
              />
            ) : (
              <div className="list-stack">
                {children.map((child) => (
                  <div key={child.id} className="child-card">
                    <div>
                      <strong>{child.name}</strong>
                      <p>
                        {new Date(child.birthDate).toLocaleDateString()} · {child.gender === "M" ? (language === "bg" ? "Момче" : "Boy") : (language === "bg" ? "Момиче" : "Girl")}
                      </p>
                      {child.notes ? <p className="helper-text">{child.notes}</p> : null}
                    </div>
                    <button type="button" onClick={() => handleDeleteChild(child.id)} className="btn btn-outline">
                      <Trash2 size={16} />
                      {language === "bg" ? "Премахни" : "Remove"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="profile-stack">
          <div className="profile-card">
            <div className="page-intro page-intro--left" style={{ marginBottom: "1.5rem" }}>
              <span className="page-intro__eyebrow"><FileText size={14} /> {language === "bg" ? "Документи" : "Documents"}</span>
              <div className="page-intro__copy">
                <h2 style={{ fontSize: "1.7rem" }}>{language === "bg" ? "Медицински документи" : "Medical documents"}</h2>
                <p className="page-intro__subtitle">{language === "bg" ? "Получените от лекаря файлове и препоръки се показват тук." : "Files and notes shared by your doctor appear here."}</p>
              </div>
            </div>

            {documents.length === 0 ? (
              <EmptyState
                icon={UserRound}
                title={language === "bg" ? "Няма налични документи." : "No documents available."}
                description={language === "bg" ? "Когато лекарят качи документ, ще можете да го изтеглите оттук." : "Once your doctor uploads a document, you will be able to download it here."}
                compact
              />
            ) : (
              <div className="list-stack">
                {documents.map((doc) => (
                  <div key={doc.id} className="document-card">
                    <div>
                      <strong>{doc.name}</strong>
                      <p>{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                      <span className="helper-text">
                        {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : doc.fileType}
                      </span>
                    </div>
                    <a href={`/api/documents/${doc.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      {language === "bg" ? "Изтегли" : "Download"}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
