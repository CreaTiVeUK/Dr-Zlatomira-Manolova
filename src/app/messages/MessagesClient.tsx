"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import PageIntro from "@/components/PageIntro";
import EmptyState from "@/components/EmptyState";
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
    const { language } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const listRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetch("/api/user/messages")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data.messages)) setMessages(data.messages);
            })
            .catch(() => setError(language === "bg" ? "Неуспешно зареждане." : "Failed to load messages."))
            .finally(() => setLoading(false));
    }, [language]);

    useEffect(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
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
        } catch (err) {
            setError(err instanceof Error ? err.message : "Send failed");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="page-shell page-shell--soft">
            <div className="container" style={{ maxWidth: 820 }}>
                <PageIntro
                    eyebrow={language === "bg" ? "Съобщения" : "Messages"}
                    title={language === "bg" ? "Разговор с клиниката" : "Clinic conversation"}
                    subtitle={language === "bg" ? "Задавайте въпроси или споделяйте промени. Отговорите могат да отнемат до 24 часа в работни дни." : "Ask questions or share updates. Replies may take up to 24 hours on business days."}
                />

                <div className="profile-card" style={{ padding: 0, overflow: "hidden", display: "grid", gridTemplateRows: "1fr auto", minHeight: 520 }}>
                    <div ref={listRef} style={{ padding: "1.25rem", overflowY: "auto", display: "grid", gap: "0.6rem", alignContent: "start" }}>
                        {loading ? (
                            <div style={{ color: "var(--text-muted)" }}>{language === "bg" ? "Зареждане..." : "Loading..."}</div>
                        ) : messages.length === 0 ? (
                            <EmptyState
                                icon={MessageCircle}
                                title={language === "bg" ? "Няма съобщения." : "No messages yet."}
                                description={language === "bg" ? "Напишете съобщение по-долу, за да започнете разговор." : "Write a message below to start the conversation."}
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
                            placeholder={language === "bg" ? "Напишете съобщение..." : "Write a message..."}
                            rows={2}
                            maxLength={2000}
                            style={{ resize: "vertical", minHeight: 44 }}
                        />
                        <button type="submit" disabled={sending || draft.trim().length === 0} className="btn btn-primary" style={{ alignSelf: "end" }}>
                            <Send size={16} />
                            {sending ? (language === "bg" ? "Изпращане..." : "Sending...") : (language === "bg" ? "Изпрати" : "Send")}
                        </button>
                    </form>
                </div>

                {error ? (
                    <div className="status-banner status-banner--error" style={{ marginTop: "1rem" }}>
                        <strong>{error}</strong>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
