"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/en";

interface Props {
  dict: Dictionary;
  lang: "en" | "bg";
}

export default function ContactFormClient({ dict, lang }: Props) {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to send message");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const successCopy =
    lang === "bg"
      ? {
          title: "Съобщението е изпратено",
          body: "Благодарим Ви. Ще се свържем с Вас възможно най-скоро.",
          reset: "Изпратете ново",
          sending: "Изпращане...",
        }
      : {
          title: "Message sent",
          body: "Thank you for reaching out. We will get back to you shortly.",
          reset: "Send another",
          sending: "Sending...",
        };

  const helperText =
    lang === "bg"
      ? "Използвайте формата за административни и организационни въпроси. За спешност се обадете директно."
      : "Use the form for administrative and scheduling questions. For urgent matters, call directly.";

  return (
    <div className="form-panel">
      <div className="stack-md">
        <div>
          <span className="page-intro__eyebrow">{dict.contact.form.title}</span>
          <h2 style={{ marginTop: "1rem" }}>{dict.contact.form.title}</h2>
          <p className="helper-text">{helperText}</p>
        </div>

        {status === "success" ? (
          <div className="status-banner status-banner--success">
            <strong>{successCopy.title}</strong>
            <p>{successCopy.body}</p>
            <button
              onClick={() => setStatus("idle")}
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                padding: 0,
                textDecoration: "underline",
                justifySelf: "flex-start",
              }}
            >
              {successCopy.reset}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="form-grid">
            {status === "error" && (
              <div className="status-banner status-banner--error">
                <strong>{errorMsg}</strong>
              </div>
            )}

            <div className="field">
              <label htmlFor="contact-name">{dict.contact.form.name}</label>
              <input
                id="contact-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="contact-email">{dict.contact.form.email}</label>
              <input
                id="contact-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="contact-message">{dict.contact.form.msg}</label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                minLength={10}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? successCopy.sending : dict.contact.form.btn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
