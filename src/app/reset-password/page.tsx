"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ResetPasswordPage() {
  const { dict } = useLanguage();
  const copy = dict.auth.resetPassword;
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  // Validate that we at least have the required params on mount
  useEffect(() => {
    if (!token || !email) {
      setError(copy.errorInvalid);
    }
  }, [token, email, copy.errorInvalid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError(copy.errorMismatch);
      return;
    }

    // Client-side strength check (mirrors server)
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setError(copy.errorWeak);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      if (res.status === 429) {
        setError("Too many requests. Please wait a moment.");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "invalid_token" || data.error === "expired_token") {
          setError(copy.errorInvalid);
        } else if (data.error?.includes("uppercase") || data.error?.includes("special")) {
          setError(copy.errorWeak);
        } else {
          setError(data.error ?? "Something went wrong.");
        }
        return;
      }

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
            {copy.signIn}
          </Link>
        </div>
      </div>
    );
  }

  // Invalid/missing token — show error with link to request a new one
  if (!token || !email) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <PageIntro
            align="left"
            eyebrow={copy.title}
            title={copy.title}
            subtitle={copy.errorInvalid}
            className="page-intro--left"
          />
          <Link href="/forgot-password" className="btn btn-primary" style={{ width: "100%" }}>
            {copy.requestNew}
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
          <div className="status-banner status-banner--error" style={{ display: "grid", gap: "0.6rem" }}>
            <strong>{error}</strong>
            {(error === copy.errorInvalid) && (
              <Link
                href="/forgot-password"
                style={{ fontSize: "0.875rem", color: "inherit", textDecoration: "underline" }}
              >
                {copy.requestNew}
              </Link>
            )}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label htmlFor="reset-password">{copy.password}</label>
            <input
              id="reset-password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <div className="field">
            <label htmlFor="reset-confirm">{copy.confirmPassword}</label>
            <input
              id="reset-confirm"
              type="password"
              name="confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !token || !email}>
            {loading ? copy.saving : copy.btn}
          </button>
        </form>
      </div>
    </div>
  );
}
