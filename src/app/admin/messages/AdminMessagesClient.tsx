"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
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
    const { language } = useLanguage();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingThreads, setLoadingThreads] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const listRef = useRef<HTMLDivElement | null>(null);

    const loadThreads = async () => {
        try {
            const res = await fetch("/api/admin/messages");
            const data = await res.json();
            if (Array.isArray(data.threads)) setThreads(data.threads);
        } finally {
            setLoadingThreads(false);
        }
    };

    useEffect(() => {
        loadThreads();
    }, []);

    useEffect(() => {
        if (!activeId) return;
        setLoadingMessages(true);
        fetch(`/api/admin/messages?patientId=${activeId}`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data.messages)) setMessages(data.messages);
            })
            .finally(() => setLoadingMessages(false));
    }, [activeId]);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
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
        } catch (err) {
            setError(err instanceof Error ? err.message : "Send failed");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="container" style={{ padding: "1.25rem", display: "grid", gap: "1rem" }}>
            <h1 className="section-title">{language === "bg" ? "Съобщения" : "Messages"}</h1>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(240px, 320px) 1fr", gap: "1rem", minHeight: 520 }}>
                <aside className="profile-card" style={{ padding: "0.5rem", overflowY: "auto" }}>
                    {loadingThreads ? (
                        <div style={{ padding: "1rem", color: "var(--text-muted)" }}>{language === "bg" ? "Зареждане..." : "Loading..."}</div>
                    ) : threads.length === 0 ? (
                        <div style={{ padding: "1rem", display: "grid", placeItems: "center", gap: "0.5rem", color: "var(--text-muted)" }}>
                            <MessageCircle size={20} />
                            <span>{language === "bg" ? "Няма разговори." : "No conversations."}</span>
                        </div>
                    ) : (
                        threads.map((t) => (
                            <button
                                key={t.patientId}
                                type="button"
                                onClick={() => setActiveId(t.patientId)}
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
                                    {new Date(t.lastAt).toLocaleString(language === "bg" ? "bg-BG" : undefined)}
                                </span>
                            </button>
                        ))
                    )}
                </aside>

                <section className="profile-card" style={{ padding: 0, display: "grid", gridTemplateRows: "1fr auto", overflow: "hidden" }}>
                    {!activeId ? (
                        <div style={{ display: "grid", placeItems: "center", color: "var(--text-muted)" }}>
                            {language === "bg" ? "Изберете разговор." : "Select a conversation."}
                        </div>
                    ) : (
                        <>
                            <div ref={listRef} style={{ padding: "1.25rem", overflowY: "auto", display: "grid", gap: "0.6rem", alignContent: "start" }}>
                                {loadingMessages ? (
                                    <div style={{ color: "var(--text-muted)" }}>{language === "bg" ? "Зареждане..." : "Loading..."}</div>
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
                                                    {new Date(m.timestamp).toLocaleString(language === "bg" ? "bg-BG" : undefined)}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <form onSubmit={handleSend} style={{ borderTop: "1px solid var(--border-card)", padding: "0.9rem", display: "grid", gridTemplateColumns: "1fr auto", gap: "0.6rem" }}>
                                <textarea
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    placeholder={language === "bg" ? "Напишете отговор..." : "Write a reply..."}
                                    rows={2}
                                    maxLength={2000}
                                    style={{ resize: "vertical", minHeight: 44 }}
                                />
                                <button type="submit" disabled={sending || draft.trim().length === 0} className="btn btn-primary" style={{ alignSelf: "end" }}>
                                    <Send size={16} />
                                    {sending ? (language === "bg" ? "Изпращане..." : "Sending...") : (language === "bg" ? "Изпрати" : "Send")}
                                </button>
                            </form>
                        </>
                    )}
                </section>
            </div>

            {error ? (
                <div className="status-banner status-banner--error">
                    <strong>{error}</strong>
                </div>
            ) : null}
        </div>
    );
}
