import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { en } from "@/lib/i18n/en";
import AdminMessagesClient from "./AdminMessagesClient";
vi.mock("@/lib/i18n/LanguageContext", () => ({ useLanguage: () => ({ language: "en", dict: en }) }));
const threads = ["Alice", "Bob"].map((name) => ({ patientId: name, name, email: `${name}@example.test`, lastMessage: "Hello", lastAt: "2026-09-16T10:00:00Z", unread: 0 }));
const reply = (text: string) => ({ id: text, content: text, fromId: "admin", toId: "Alice", timestamp: "2026-09-16T10:00:00Z" });
function response(data: unknown) { return { ok: true, json: async () => data }; }
beforeEach(() => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    Element.prototype.scrollTo = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("ignores stale responses after selecting a different patient", async () => {
    let resolveAlice!: (value: unknown) => void;
    vi.stubGlobal("fetch", vi.fn((url: string) => {
        if (url.endsWith("patientId=Alice")) return new Promise((resolve) => { resolveAlice = resolve; });
        if (url.endsWith("patientId=Bob")) return Promise.resolve(response({ messages: [reply("Bob message")] }));
        return Promise.resolve(response({ threads }));
    }));
    render(<AdminMessagesClient adminId="admin" />);
    fireEvent.click(await screen.findByRole("button", { name: /Alice/ }));
    fireEvent.click(screen.getByRole("button", { name: /Bob/ }));
    await screen.findByText("Bob message");
    await act(async () => { resolveAlice(response({ messages: [reply("Stale Alice message")] })); });
    expect(screen.queryByText("Stale Alice message")).not.toBeInTheDocument();
    expect(screen.getByText("Bob message")).toBeVisible();
});
it("keeps the recipient and draft fixed until a reply finishes sending", async () => {
    let finishSend!: (value: unknown) => void;
    vi.stubGlobal("fetch", vi.fn((url: string, options?: RequestInit) => {
        if (options?.method === "POST") return new Promise((resolve) => { finishSend = resolve; });
        return Promise.resolve(response(url.includes("?") ? { messages: [] } : { threads }));
    }));
    render(<AdminMessagesClient adminId="admin" />);
    fireEvent.click(await screen.findByRole("button", { name: /Alice/ }));
    const composer = await screen.findByRole("textbox", { name: "Reply" });
    fireEvent.change(composer, { target: { value: "Reply for Alice" } });
    await waitFor(() => expect(screen.getByRole("button", { name: "Send" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByRole("button", { name: /Bob/ })).toBeDisabled();
    expect(composer).toBeDisabled();
    await act(async () => { finishSend(response(reply("Reply for Alice"))); });
    expect(await screen.findByText("Reply for Alice")).toBeVisible();
    expect(screen.getByRole("button", { name: /Bob/ })).toBeEnabled();
});
