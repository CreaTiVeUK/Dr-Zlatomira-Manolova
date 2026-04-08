"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Status = "loading" | "success" | "error" | "expired";

export default function VerifyEmailPage() {
    const { language } = useLanguage();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<Status>("loading");
    const [message, setMessage] = useState("");
    const [email, setEmailState] = useState("");
    const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

    const copy = {
        title: language === "bg" ? "Потвърждение на имейл" : "Email Verification",
        loading: language === "bg" ? "Потвърждаваме вашия имейл…" : "Verifying your email…",
        success: language === "bg" ? "Имейлът е потвърден!" : "Email verified!",
        successSub: language === "bg"
            ? "Акаунтът ви е активен. Можете да влезете."
            : "Your account is active. You can now sign in.",
        error: language === "bg" ? "Невалидна връзка" : "Invalid link",
        expired: language === "bg" ? "Връзката е изтекла" : "Link expired",
        login: language === "bg" ? "Вход" : "Sign in",
        resend: language === "bg" ? "Изпрати нова връзка" : "Resend verification link",
        resending: language === "bg" ? "Изпращане…" : "Sending…",
        resent: language === "bg" ? "Нова връзка е изпратена. Проверете пощата си." : "A new link has been sent. Check your inbox.",
    };

    useEffect(() => {
        const token = searchParams.get("token");
        const emailParam = searchParams.get("email");

        if (!token || !emailParam) {
            setStatus("error");
            setMessage(language === "bg" ? "Липсват параметри за потвърждение." : "Missing verification parameters.");
            return;
        }

        setEmailState(emailParam);

        fetch(`/api/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(emailParam)}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setStatus("success");
                } else if (data.error?.toLowerCase().includes("expired")) {
                    setStatus("expired");
                    setMessage(data.error);
                } else {
                    setStatus("error");
                    setMessage(data.error || "Verification failed.");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage(language === "bg" ? "Възникна грешка. Опитайте пак." : "An error occurred. Please try again.");
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleResend = async () => {
        if (!email || resendState !== "idle") return;
        setResendState("sending");
        try {
            await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
        } catch {
            // ignore — response is always generic
        }
        setResendState("sent");
    };

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <PageIntro
                    align="left"
                    eyebrow={copy.title}
                    title={status === "loading" ? copy.loading : status === "success" ? copy.success : copy.error}
                    subtitle={status === "success" ? copy.successSub : message}
                    className="page-intro--left"
                />

                {status === "loading" && (
                    <div className="status-banner status-banner--info">
                        {copy.loading}
                    </div>
                )}

                {status === "success" && (
                    <>
                        <div className="status-banner status-banner--success">
                            <strong>{copy.success}</strong> {copy.successSub}
                        </div>
                        <Link href="/login" className="btn btn-primary" style={{ marginTop: "1rem", display: "inline-block" }}>
                            {copy.login}
                        </Link>
                    </>
                )}

                {(status === "error" || status === "expired") && (
                    <>
                        <div className="status-banner status-banner--error">
                            <strong>{message}</strong>
                        </div>
                        {resendState === "sent" ? (
                            <div className="status-banner status-banner--success" style={{ marginTop: "0.75rem" }}>
                                {copy.resent}
                            </div>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={resendState === "sending"}
                                className="btn btn-outline"
                                type="button"
                                style={{ marginTop: "0.75rem" }}
                            >
                                {resendState === "sending" ? copy.resending : copy.resend}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
