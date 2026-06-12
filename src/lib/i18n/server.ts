import { cookies } from "next/headers";
import { bg, en } from "./dictionaries";

export type ServerLanguage = "en" | "bg";

export async function getServerLanguage(): Promise<ServerLanguage> {
    const cookieStore = await cookies();
    const language = cookieStore.get("language")?.value;

    // Default: Bulgarian — primary audience. Must agree with the client-side
    // default in LanguageContext.getInitialLanguage and <html lang> in
    // layout.tsx, otherwise pages flash one language and settle on another.
    return language === "en" ? "en" : "bg";
}

export async function getServerDictionary() {
    const language = await getServerLanguage();
    return {
        language,
        dict: language === "bg" ? bg : en,
    };
}
