import { cookies } from "next/headers";
import { bg, en } from "./dictionaries";

export type ServerLanguage = "en" | "bg";

export async function getServerLanguage(): Promise<ServerLanguage> {
    const cookieStore = await cookies();
    const language = cookieStore.get("language")?.value;

    return language === "bg" ? "bg" : "en";
}

export async function getServerDictionary() {
    const language = await getServerLanguage();
    return {
        language,
        dict: language === "bg" ? bg : en,
    };
}
