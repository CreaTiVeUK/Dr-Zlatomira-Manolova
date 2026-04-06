"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Dictionary } from "@/lib/i18n/dictionaries";

function SocialLoginButton({ provider, label, dict }: { provider: string; label: string; dict: Dictionary }) {
  const icons: Record<string, React.ReactNode> = {
    google: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
      </svg>
    ),
    facebook: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    apple: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M17.057 1.293c.854-.984 1.428-2.35 1.272-3.71.055-.008.204-.012.356-.012 1.168 0 2.235.452 2.923 1.18.847.818 1.48 2.054 1.348 3.36-.023.238-.13.5-.23.75-.43.918-.945 1.734-1.504 2.503M18.877 8.35c.10.05 1.18 1.14 1.18 2.04 0 .046-.02.433-.04.475-.76 2.37-2.91 5.92-5.46 5.92-1.12 0-2.12-.59-3.23-.59-1.2 0-2.36.63-3.48.63-2.52 0-5.37-3.83-5.37-7.42 0-2.3.8-4.43 2.13-5.83 1.12-1.18 2.63-1.85 4.13-1.85 1.3 0 2.45.54 3.46.54 1.1 0 2.22-.54 3.66-.54 1.44 0 2.76.71 3.56 1.85z" />
      </svg>
    ),
  };

  const brandColors: Record<string, { bg: string; text: string; border: string }> = {
    google: { bg: "#fff", text: "#3c4043", border: "#dadce0" },
    facebook: { bg: "#0866FF", text: "#fff", border: "#0866FF" },
    apple: { bg: "#000", text: "#fff", border: "#000" },
  };

  const style = brandColors[provider];

  return (
    <button
      onClick={() => signIn(provider, { callbackUrl: "/book" })}
      style={{
        background: style.bg,
        color: style.text,
        borderColor: style.border,
        boxShadow: provider === "google" ? "0 1px 2px rgba(60,64,67,0.3), 0 1px 3px rgba(60,64,67,0.15)" : undefined,
      }}
      className="social-btn btn-outline"
      type="button"
    >
      <span style={{ display: "flex", alignItems: "center" }}>{icons[provider]}</span>
      <span>{dict.auth.login.continueWith} {label}</span>
    </button>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  AccountNotLinked: "This email is linked to a different sign-in method.",
  EmailNotVerified: "Please verify your email before signing in.",
  AccountLocked: "Account locked due to multiple failed attempts. Try again later.",
};

export default function LoginPage() {
  const { dict, language } = useLanguage();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/book";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    searchParams.get("error")
      ? (ERROR_MESSAGES[searchParams.get("error")!] ?? "Sign-in failed. Please try again.")
      : ""
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          ERROR_MESSAGES[result.error] ??
          (language === "bg" ? "Невалиден имейл или парола." : "Invalid email or password.")
        );
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError(language === "bg" ? "Възникна грешка при вход." : "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <PageIntro
          align="left"
          eyebrow={dict.userMenu.login}
          title={dict.auth.login.title}
          subtitle={language === "bg" ? "Влезте в профила си, за да управлявате часове и документи." : "Sign in to manage appointments, records, and secure clinical communication."}
          className="page-intro--left"
        />

        {error ? (
          <div className="status-banner status-banner--error">
            <strong>{error}</strong>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label htmlFor="login-email">{dict.auth.login.email}</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">{dict.auth.login.password}</label>
            <input
              id="login-password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "…" : dict.auth.login.btn}
          </button>
        </form>

        <div className="auth-divider">{dict.auth.login.or}</div>

        <div className="social-stack">
          <SocialLoginButton provider="google" label="Google" dict={dict} />
          <SocialLoginButton provider="facebook" label="Facebook" dict={dict} />
          <SocialLoginButton provider="apple" label="Apple ID" dict={dict} />
        </div>

        <p className="text-muted">
          {dict.auth.login.noAccount}{" "}
          <Link href="/register" style={{ color: "var(--primary-teal)", fontWeight: 700 }}>
            {dict.auth.login.registerLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
