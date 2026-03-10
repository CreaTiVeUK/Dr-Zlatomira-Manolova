"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ContactPage() {
  const { dict, language } = useLanguage();
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
    language === "bg"
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

  const introCards =
    language === "bg"
      ? [
          { value: "24ч", label: "обичаен отговор" },
          { value: "2", label: "локации за преглед" },
          { value: "6 дни", label: "седмично обслужване" },
        ]
      : [
          { value: "24h", label: "typical response" },
          { value: "2", label: "clinic locations" },
          { value: "6 days", label: "weekly coverage" },
        ];

  return (
    <div className="page-shell page-shell--soft">
      <div className="container">
        <PageIntro
          eyebrow={dict.contact.clinics}
          title={dict.contact.title}
          subtitle={dict.contact.subtitle}
          actions={
            <div className="meta-grid" style={{ width: "100%" }}>
              {introCards.map((item) => (
                <div key={item.label} className="meta-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          }
        />

        <div className="contact-layout">
          <div className="stack-lg">
            <div className="contact-panel stack-md">
              <h3>{dict.contact.clinics}</h3>

              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-item__layout">
                    <div className="stack-md" style={{ gap: "0.5rem" }}>
                      <span className="clinical-badge">
                        <MapPin size={14} />
                        {dict.contact.medicalCenter}
                      </span>
                      <p>
                        {dict.contact.addressMain}
                        <br />
                        <strong>{dict.contact.tel}:</strong> {dict.footer.phone}
                        <br />
                        <strong>{dict.contact.email}:</strong> zlatomira.manolova@gmail.com
                      </p>
                      <div className="contact-item__actions">
                        <Link href={`tel:${dict.footer.phone}`} className="btn btn-outline">
                          <Phone size={16} />
                          {dict.contact.tel}
                        </Link>
                        <Link href="mailto:zlatomira.manolova@gmail.com" className="btn btn-primary">
                          <Mail size={16} />
                          {dict.contact.email}
                        </Link>
                      </div>
                    </div>
                    <span className="contact-item__icon" aria-hidden="true">
                      <Mail size={18} />
                    </span>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item__layout">
                    <div className="stack-md" style={{ gap: "0.5rem" }}>
                      <span className="clinical-badge">
                        <Phone size={14} />
                        {dict.contact.partnerHospital}
                      </span>
                      <p>
                        {dict.contact.addressSecond}
                        <br />
                        <strong>{dict.contact.tel}:</strong> {dict.footer.phone}
                      </p>
                      <div className="contact-item__actions">
                        <Link href={`tel:${dict.footer.phone}`} className="btn btn-outline">
                          <Phone size={16} />
                          {language === "bg" ? "Обади се" : "Call now"}
                        </Link>
                      </div>
                    </div>
                    <span className="contact-item__icon" aria-hidden="true">
                      <Phone size={18} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-card surface-card--accent">
              <h4 style={{ marginBottom: "0.65rem" }}>{dict.contact.admin.title}</h4>
              <p>{dict.contact.admin.text}</p>
              <div className="contact-item__actions">
                <Link href="/book" className="btn btn-primary">
                  {dict.header.nav.book}
                </Link>
              </div>
            </div>

            <div className="map-card">
              <iframe
                src="https://maps.google.com/maps?q=42.136959,24.790681&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={dict.contact.clinics}
              ></iframe>
            </div>
          </div>

          <div className="form-panel">
            <div className="stack-md">
              <div>
                <span className="page-intro__eyebrow">{dict.contact.form.title}</span>
                <h3 style={{ marginTop: "1rem" }}>{dict.contact.form.title}</h3>
                <p className="helper-text">
                  {language === "bg"
                    ? "Използвайте формата за административни и организационни въпроси. За спешност се обадете директно."
                    : "Use the form for administrative and scheduling questions. For urgent matters, call directly."}
                </p>
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
        </div>
      </div>
    </div>
  );
}
