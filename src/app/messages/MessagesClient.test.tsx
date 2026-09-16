import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { en } from "@/lib/i18n/en";
import { bg } from "@/lib/i18n/bg";
import MessagesClient from "./MessagesClient";

let language = "en";
vi.mock("@/lib/i18n/LanguageContext", () => ({ useLanguage: () => ({ language, dict: language === "bg" ? bg : en }) }));
beforeEach(() => {
    language = "en";
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    Element.prototype.scrollTo = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("shows a localized load error instead of claiming the inbox is empty", async () => {
    language = "bg";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(<MessagesClient currentUserId="patient" />);
    expect(await screen.findByText(bg.messages.loadError)).toBeVisible();
    expect(screen.queryByText(bg.messages.empty)).not.toBeInTheDocument();
});
it("retains a failed draft, localizes the error, and does not refetch on language change", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [] }) })
        .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "English-only server error" }) });
    vi.stubGlobal("fetch", fetchMock);
    const { rerender } = render(<MessagesClient currentUserId="patient" />);
    await screen.findByText(en.messages.empty);
    fireEvent.change(screen.getByRole("textbox", { name: "Message" }), { target: { value: "Hello doctor" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    await screen.findByText(en.messages.sendError);
    expect(screen.getByRole("textbox")).toHaveValue("Hello doctor");
    language = "bg";
    rerender(<MessagesClient currentUserId="patient" />);
    await waitFor(() => expect(screen.getByText(bg.messages.sendError)).toBeVisible());
    expect(fetchMock).toHaveBeenCalledTimes(2);
});
