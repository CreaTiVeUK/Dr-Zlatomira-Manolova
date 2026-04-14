"use client";

import { useState } from "react";

type SetupState =
  | { stage: "idle" }
  | { stage: "provisioning"; secret: string; otpauth: string }
  | { stage: "verified"; backupCodes: string[] };

type Props = {
  email: string;
  enabled: boolean;
  language: string;
};

export default function TwoFactorManager({ enabled, language }: Props) {
  const isBg = language === "bg";
  const t = (bg: string, en: string) => (isBg ? bg : en);

  const [setupState, setSetupState] = useState<SetupState>({ stage: "idle" });
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startSetup = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/account/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start 2FA setup.");
      setSetupState({ stage: "provisioning", secret: data.secret, otpauth: data.otpauth });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/account/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");
      setSetupState({ stage: "verified", backupCodes: data.backupCodes });
      setCode("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const disable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/account/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to disable 2FA.");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  if (enabled) {
    return (
      <form onSubmit={disable} className="form-grid" style={{ maxWidth: "28rem" }}>
        <p>
          {t(
            "Двуфакторната автентикация е активна. За изключване въведете паролата си и текущ код.",
            "Two-factor authentication is active. To disable it, enter your password and a current authenticator code.",
          )}
        </p>
        <div className="field">
          <label>{t("ПАРОЛА", "PASSWORD")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <div className="field">
          <label>{t("АВТЕНТИКАЦИОНЕН КОД", "AUTHENTICATION CODE")}</label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            required
          />
        </div>
        {error && <div className="status-banner status-banner--error">{error}</div>}
        <button type="submit" className="btn btn-outline" disabled={loading}>
          {loading ? "…" : t("Изключи 2FA", "Disable 2FA")}
        </button>
      </form>
    );
  }

  if (setupState.stage === "verified") {
    return (
      <div style={{ display: "grid", gap: "1rem", maxWidth: "32rem" }}>
        <div className="status-banner status-banner--success">
          <strong>{t("2FA е активирана.", "2FA enabled.")}</strong>
          <p>
            {t(
              "Запазете тези резервни кодове на сигурно място. Всеки е за еднократна употреба.",
              "Save these backup codes somewhere safe. Each works exactly once.",
            )}
          </p>
        </div>
        <pre
          style={{
            background: "var(--surface-page)",
            padding: "1rem",
            borderRadius: "12px",
            fontFamily: "monospace",
            fontSize: "1rem",
            lineHeight: 1.7,
          }}
        >
          {setupState.backupCodes.join("\n")}
        </pre>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => navigator.clipboard?.writeText(setupState.backupCodes.join("\n"))}
        >
          {t("Копирай кодовете", "Copy codes")}
        </button>
        <a href="/admin/security" className="btn btn-primary">
          {t("Завърши", "Done")}
        </a>
      </div>
    );
  }

  if (setupState.stage === "provisioning") {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      setupState.otpauth,
    )}`;
    return (
      <form onSubmit={verify} className="form-grid" style={{ maxWidth: "32rem" }}>
        <ol style={{ paddingLeft: "1.2rem", display: "grid", gap: "0.5rem" }}>
          <li>
            {t(
              "Сканирайте QR кода с приложение като Google Authenticator, 1Password или Authy.",
              "Scan this QR code with Google Authenticator, 1Password, Authy or a similar app.",
            )}
          </li>
          <li>
            {t(
              "Въведете 6-цифрения код от приложението, за да завършите настройката.",
              "Enter the 6-digit code from the app to confirm setup.",
            )}
          </li>
        </ol>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {/* Third-party QR renderer. If blocked by CSP, users can paste the secret manually. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrUrl} alt="2FA QR code" width={220} height={220} style={{ borderRadius: "8px" }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <span className="helper-text">{t("Или въведете ръчно:", "Or enter manually:")}</span>
          <br />
          <code style={{ fontFamily: "monospace", fontSize: "0.95rem", letterSpacing: "0.05em" }}>
            {setupState.secret}
          </code>
        </div>
        <div className="field">
          <label>{t("АВТЕНТИКАЦИОНЕН КОД", "AUTHENTICATION CODE")}</label>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            required
            autoFocus
          />
        </div>
        {error && <div className="status-banner status-banner--error">{error}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "…" : t("Потвърди и активирай", "Confirm and enable")}
        </button>
      </form>
    );
  }

  return (
    <div style={{ maxWidth: "32rem" }}>
      <p>
        {t(
          "Двуфакторната автентикация добавя допълнителен слой защита към вашия администраторски акаунт.",
          "Two-factor authentication adds an extra layer of security to your admin account.",
        )}
      </p>
      {error && <div className="status-banner status-banner--error" style={{ marginTop: "1rem" }}>{error}</div>}
      <button type="button" className="btn btn-primary" onClick={startSetup} disabled={loading} style={{ marginTop: "1rem" }}>
        {loading ? "…" : t("Активирай 2FA", "Enable 2FA")}
      </button>
    </div>
  );
}
