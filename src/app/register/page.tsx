"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import StatusBanner from "@/components/StatusBanner";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function RegisterPage() {
  const { dict, language } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<"" | "error" | "passwordHelp" | "rateLimit">("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/login?registered=true");
      } else {
        setError(res.status === 429 ? "rateLimit" : data.code === "WEAK_PASSWORD" ? "passwordHelp" : "error");
      }
    } catch {
      setError("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <PageIntro
          align="left"
          eyebrow={dict.auth.register.title}
          title={dict.auth.register.title}
          subtitle={language === "bg" ? "Създайте защитен профил за записване, управление на часове и достъп до медицински документи." : "Create a secure account for booking, appointment management, and access to medical documents."}
          className="page-intro--left"
        />

        {error ? (
          <StatusBanner variant="error" focus>
            <strong>{dict.auth.register[error]}</strong>
          </StatusBanner>
        ) : null}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label htmlFor="register-name">{dict.auth.register.name}</label>
            <input id="register-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder={dict.auth.register.namePlaceholder} minLength={2} name="name" autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="register-email">{dict.auth.register.email}</label>
            <input id="register-email" name="email" autoComplete="email" spellCheck={false} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" />
          </div>
          <div className="field">
            <label htmlFor="register-phone">{dict.auth.register.phone}</label>
            <input id="register-phone" name="phone" autoComplete="tel" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+359 88..." />
          </div>
          <div className="field">
            <label htmlFor="register-password">{dict.auth.register.password}</label>
            <input id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} maxLength={128} name="password" autoComplete="new-password" aria-describedby="register-password-help" />
            <p id="register-password-help" className="text-muted">{dict.auth.register.passwordHelp}</p>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? dict.auth.register.loading : dict.auth.register.btn}
          </button>
        </form>

        <p className="text-muted">
          {dict.auth.register.hasAccount}{" "}
          <Link href="/login" style={{ color: "var(--primary-teal)", fontWeight: 700 }}>
            {dict.auth.register.loginLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
