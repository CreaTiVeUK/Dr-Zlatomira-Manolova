"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import StatusBanner from "@/components/StatusBanner";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Thread {
    patientId: string;
    name: string;
    email: string;
    lastMessage: string;
    lastAt: string;
    unread: number;
}

interface Message {
    id: string;
    content: string;
    timestamp: string;
    fromId: string;
    toId: string;
    readAt: string | null;
}

export default function AdminMessagesClient({ adminId }: { adminId: string }) {
    const { language, dict } = useLanguage();
    const copy = dict.messages;
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingThreads, setLoadingThreads] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<"" | "loadError" | "sendError">("");
    const listRef = useRef<HTMLDivElement | null>(null);

    const loadThreads = async () => {
        try {
            const res = await fetch("/api/admin/messages");
            if (!res.ok) throw new Error("Load failed");
            const data = await res.json();
            if (Array.isArray(data.threads)) setThreads(data.threads);
        } catch {
            setError("loadError");
        } finally {
            setLoadingThreads(false);
        }
    };

    useEffect(() => {
        loadThreads();
    }, []);

    useEffect(() => {
        if (!activeId) return;
        const controller = new AbortController();
        setLoadingMessages(true);
        setMessages([]);
        setDraft("");
        setError("");
        fetch(`/api/admin/messages?patientId=${encodeURIComponent(activeId)}`, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error("Load failed");
                return res.json();
            })
            .then((data) => {
                if (!controller.signal.aborted && Array.isArray(data.messages)) setMessages(data.messages);
            })
            .catch(() => { if (!controller.signal.aborted) setError("loadError"); })
            .finally(() => { if (!controller.signal.aborted) setLoadingMessages(false); });
        return () => controller.abort();
    }, [activeId]);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }, [messages]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = draft.trim();
        if (!trimmed || !activeId || sending) return;
        setSending(true);
        setError("");
        try {
            const res = await fetch("/api/admin/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patientId: activeId, content: trimmed }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Send failed");
            setMessages((m) => [...m, data]);
            setDraft("");
            loadThreads();
        } catch {
            setError("sendError");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="container" style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
            <h1 className="section-title">{copy.title}</h1>

            <div className="admin-messages-layout">
                <aside className="profile-card" style={{ padding: "0.5rem", overflowY: "auto" }}>
                    {loadingThreads ? (
                        <div style={{ padding: "1rem", color: "var(--text-muted)" }}>{copy.loading}</div>
                    ) : threads.length === 0 ? (
                        <div style={{ padding: "1rem", display: "grid", placeItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
                            <MessageCircle size={20} />
                            <span>{copy.noConversations}</span>
                        </div>
                    ) : (
                        threads.map((t) => (
                            <button
                                key={t.patientId}
                                type="button"
                                onClick={() => { if (!sending) setActiveId(t.patientId); }}
                                disabled={sending}
                                aria-pressed={activeId === t.patientId}
                                style={{
                                    display: "grid",
                                    gap: "0.2rem",
                                    padding: "0.75rem",
                                    borderRadius: 12,
                                    border: 0,
                                    textAlign: "left",
                                    background: activeId === t.patientId ? "var(--surface-card-strong)" : "transparent",
                                    cursor: "pointer",
                                    width: "100%",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", alignItems: "center" }}>
                                    <strong>{t.name}</strong>
                                    {t.unread > 0 ? (
                                        <span style={{ background: "var(--primary-teal)", color: "white", fontSize: "0.72rem", fontWeight: 700, borderRadius: 999, padding: "0.1rem 0.5rem" }}>
                                            {t.unread}
                                        </span>
                                    ) : null}
                                </div>
                                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {t.lastMessage}
                                </span>
                                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                                    {new Date(t.lastAt).toLocaleString(language === "bg" ? "bg-BG" : "en-GB")}
                                </span>
                            </button>
                        ))
                    )}
                </aside>

                <section className="profile-card" style={{ padding: 0, display: "grid", gridTemplateRows: "1fr auto", overflow: "hidden" }}>
                    {!activeId ? (
                        <div style={{ display: "grid", placeItems: "center", color: "var(--text-muted)" }}>
                            {copy.selectConversation}
                        </div>
                    ) : (
                        <>
                            <div role="log" aria-label={copy.conversation} aria-live="polite" aria-busy={loadingMessages} ref={listRef} style={{ padding: "1.25rem", overflowY: "auto", display: "grid", gap: "0.6rem", alignContent: "start" }}>
                                {loadingMessages ? (
                                    <div style={{ color: "var(--text-muted)" }}>{copy.loading}</div>
                                ) : (
                                    messages.map((m) => {
                                        const mine = m.fromId === adminId;
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
                                    placeholder={copy.replyPlaceholder}
                                    rows={2}
                                    maxLength={2000}
                                    style={{ resize: "vertical", minHeight: 44, minWidth: 0, width: "100%" }}
                                    disabled={sending || loadingMessages}
                                    aria-label={copy.reply}
                                />
                                <button type="submit" disabled={sending || loadingMessages || draft.trim().length === 0} className="btn btn-primary" style={{ alignSelf: "end" }}>
                                    <Send size={16} aria-hidden="true" />
                                    {sending ? copy.sending : copy.send}
                                </button>
                            </form>
                        </>
                    )}
                </section>
            </div>

            {error ? (
                <StatusBanner variant="error" focus>
                    <strong>{copy[error]}</strong>
                </StatusBanner>
            ) : null}
        </div>
    );
}
