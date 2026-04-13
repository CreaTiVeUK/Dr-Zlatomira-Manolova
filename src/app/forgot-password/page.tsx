"use client";

import { useState } from "react";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ForgotPasswordPage() {
  const { dict } = useLanguage();
  const copy = dict.auth.forgotPassword;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 429) {
        setError("Too many requests. Please wait a moment.");
        return;
      }

      // Always show success regardless of response (prevents enumeration)
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <PageIntro
            align="left"
            eyebrow={copy.title}
            title={copy.successTitle}
            subtitle={copy.successMessage}
            className="page-intro--left"
          />
          <Link href="/login" className="btn btn-primary" style={{ width: "100%" }}>
            {copy.backToLogin}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <PageIntro
          align="left"
          eyebrow={dict.userMenu.login}
          title={copy.title}
          subtitle={copy.subtitle}
          className="page-intro--left"
        />

        {error ? (
          <div className="status-banner status-banner--error">
            <strong>{error}</strong>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label htmlFor="forgot-email">{copy.email}</label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              autoComplete="email"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? copy.sending : copy.btn}
          </button>
        </form>

        <p className="text-muted" style={{ textAlign: "center" }}>
          <Link href="/login" style={{ color: "var(--primary-teal)", fontWeight: 700 }}>
            {copy.backToLogin}
          </Link>
        </p>
      </div>
    </div>
  );
}
