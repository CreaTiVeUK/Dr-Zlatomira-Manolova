/**
 * Server-side dictionary loader.
 *
 * Reads the `language` cookie and returns the corresponding dictionary.
 * Defaults to Bulgarian (`bg`) because 90%+ of the target audience is
 * Bulgarian-speaking, and server-rendered HTML should be in Bulgarian by
 * default for optimal local SEO.
 *
 * Usage in server components:
 *   const { dict, lang } = await getDictionary();
 */

import { cookies } from "next/headers";
import type { Dictionary } from "./en";

export type Lang = "en" | "bg";

export async function getDictionary(): Promise<{ dict: Dictionary; lang: Lang }> {
    const cookieStore = await cookies();
    const lang: Lang = cookieStore.get("language")?.value === "en" ? "en" : "bg";

    if (lang === "en") {
        const { en } = await import("./en");
        return { dict: en, lang };
    }
    const { bg } = await import("./bg");
    return { dict: bg, lang };
}
