import { prisma } from "./prisma";

const PROFILE_URL = "https://superdoc.bg/lekar/zlatomira-manolova";
const FETCH_TIMEOUT_MS = 8_000;

async function translateToEnglish(text: string): Promise<string> {
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) return text;

    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 6_000);
        const res = await fetch("https://api-free.deepl.com/v2/translate", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                auth_key: apiKey,
                text,
                source_lang: "BG",
                target_lang: "EN",
            }),
            signal: controller.signal,
        });
        clearTimeout(tid);
        if (!res.ok) return text;
        const data = await res.json() as { translations: { text: string }[] };
        return data.translations?.[0]?.text ?? text;
    } catch {
        return text;
    }
}

export async function syncSuperdocReviews() {
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

        let response: Response;
        try {
            response = await fetch(PROFILE_URL, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                },
                signal: controller.signal,
            });
        } finally {
            clearTimeout(tid);
        }

        if (!response.ok) throw new Error(`Superdoc inaccessible: ${response.status}`);

        const html = await response.text();

        // ── Global rating ────────────────────────────────────────────────────
        const ratingMatch =
            html.match(/<div[^>]*fontSize:\s*2\.2rem[^>]*>([\d.]+)\/5<\/div>/) ||
            html.match(/<span[^>]*class="rating-value"[^>]*>([\d.]+)<\/span>/) ||
            html.match(/([\d.]+)\s*\/\s*5/);
        const reviewsCountMatch =
            html.match(/(\d+)\s*проверени отзива/) ||
            html.match(/(\d+)\s*verified reviews/);

        const rating = ratingMatch ? `${ratingMatch[1]}/5` : undefined;
        const reviewsCount = reviewsCountMatch ? reviewsCountMatch[1] : undefined;

        if (rating || reviewsCount) {
            await prisma.superdocStat.upsert({
                where: { id: "singleton" },
                update: {
                    ...(rating && { rating }),
                    ...(reviewsCount && { reviewsCount }),
                },
                create: {
                    id: "singleton",
                    rating: rating ?? "5.0/5",
                    reviewsCount: reviewsCount ?? "14",
                },
            });
        }

        // ── Individual reviews ───────────────────────────────────────────────
        // Try to match review blocks; some Superdoc layouts include a rating
        // per review in a sibling element. We extract what we can; unparseable
        // fields are stored as null rather than fabricated.
        const reviewBlocks = html.match(/<div class="comment-text">([\s\S]*?)<\/div>/g) ?? [];
        let translated = 0;
        let skipped = 0;

        for (const block of reviewBlocks) {
            const textBg = block.replace(/<[^>]*>/g, "").trim();
            if (!textBg || textBg.length < 10) continue;

            const existing = await prisma.superdocReview.findUnique({ where: { textBg } });
            if (existing) { skipped++; continue; }

            // Try to extract a per-review star rating from nearby HTML
            // (e.g. aria-label="4 stars" or data-rating="4")
            const ratingAttrMatch = block.match(/(?:aria-label|data-rating)="(\d)\s*(?:stars?)?"/i);
            const reviewRating = ratingAttrMatch ? parseInt(ratingAttrMatch[1], 10) : null;

            const textEn = await translateToEnglish(textBg);
            translated++;

            await prisma.superdocReview.create({
                data: {
                    textBg,
                    textEn,
                    // Author name is not reliably extractable from the current
                    // Superdoc HTML without a real parser. Use the verified badge
                    // text that Superdoc itself displays.
                    authorBg: "Потвърден пациент",
                    authorEn: "Verified Patient",
                    // Use scraped rating if found; null otherwise (don't fabricate 5-star)
                    rating: reviewRating,
                },
            });
        }

        return {
            success: true,
            rating: rating ?? "unchanged",
            reviewsCount: reviewsCount ?? "unchanged",
            newReviews: translated,
            existingReviews: skipped,
        };
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        const isTimeout = error instanceof Error && error.name === "AbortError";
        console.error("Superdoc Sync Error:", error);
        return {
            success: false,
            error: isTimeout ? `Request timed out after ${FETCH_TIMEOUT_MS}ms` : msg,
        };
    }
}
