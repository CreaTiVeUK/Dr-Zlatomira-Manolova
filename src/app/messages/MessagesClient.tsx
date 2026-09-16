"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import PageIntro from "@/components/PageIntro";
import EmptyState from "@/components/EmptyState";
import StatusBanner from "@/components/StatusBanner";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Message {
    id: string;
    content: string;
    timestamp: string;
    fromId: string;
    toId: string;
    readAt: string | null;
}

export default function MessagesClient({ currentUserId }: { currentUserId: string }) {
    const { language, dict } = useLanguage();
    const copy = dict.messages;
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<"" | "loadError" | "sendError">("");
    const listRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        fetch("/api/user/messages", { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error("Load failed");
                return res.json();
            })
            .then((data) => {
                if (!controller.signal.aborted && Array.isArray(data.messages)) setMessages(data.messages);
            })
            .catch(() => { if (!controller.signal.aborted) setError("loadError"); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }, [messages]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed || sending) return;
        setSending(true);
        setError("");
        try {
            const res = await fetch("/api/user/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: trimmed }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Send failed");
            setMessages((m) => [...m, data]);
            setDraft("");
        } catch {
            setError("sendError");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="page-shell page-shell--soft">
            <div className="container" style={{ maxWidth: 820 }}>
                <PageIntro
                    eyebrow={copy.title}
                    title={copy.conversation}
                    subtitle={copy.description}
                />

                <div className="profile-card" style={{ padding: 0, overflow: "hidden", display: "grid", gridTemplateRows: "1fr auto", minHeight: 520 }}>
                    <div role="log" aria-label={copy.conversation} aria-live="polite" aria-busy={loading} ref={listRef} style={{ padding: "1.25rem", overflowY: "auto", display: "grid", gap: "0.6rem", alignContent: "start" }}>
                        {loading ? (
                            <div style={{ color: "var(--text-muted)" }}>{copy.loading}</div>
                        ) : error === "loadError" ? null : messages.length === 0 ? (
                            <EmptyState
                                icon={MessageCircle}
                                title={copy.empty}
                                description={copy.emptyDescription}
                                compact
                            />
                        ) : (
                            messages.map((m) => {
                                const mine = m.fromId === currentUserId;
                                return (
                                    <div
                                        key={m.id}
                                        style={{
                                            justifySelf: mine ? "end" : "start",
                                            maxWidth: "80%",
                                            background: mine ? "var(--primary-teal)" : "var(--surface-card-strong)",
                                            color: mine ? "white" : "var(--text-charcoal)",
                                            padding: "0.65rem 0.9rem",
                                            borderRadius: mine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                                            boxShadow: "var(--shadow-sm)",
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        <div>{m.content}</div>
                                        <div style={{ fontSize: "0.72rem", opacity: 0.75, marginTop: "0.35rem" }}>
                                            {new Date(m.timestamp).toLocaleString(language === "bg" ? "bg-BG" : "en-GB")}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <form onSubmit={handleSend} style={{ borderTop: "1px solid var(--border-card)", padding: "0.9rem", display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "0.6rem" }}>
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            placeholder={copy.messagePlaceholder}
                            rows={2}
                            maxLength={2000}
                            style={{ resize: "vertical", minHeight: 44, minWidth: 0, width: "100%" }}
                            disabled={sending || loading}
                            aria-label={copy.message}
                        />
                        <button type="submit" disabled={sending || loading || draft.trim().length === 0} className="btn btn-primary" style={{ alignSelf: "end" }}>
                            <Send size={16} aria-hidden="true" />
                            {sending ? copy.sending : copy.send}
                        </button>
                    </form>
                </div>

                {error ? (
                    <StatusBanner variant="error" focus style={{ marginTop: "1rem" }}>
                        <strong>{copy[error]}</strong>
                    </StatusBanner>
                ) : null}
            </div>
        </div>
    );
}
