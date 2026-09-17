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
        // Superdoc marks this up as schema.org AggregateRating microdata (their
        // previous layout used a plain "X/5" div, which this page no longer has
        // at all — the site was redesigned since this scraper was written).
        const aggregateBlock = html.match(/itemtype="http:\/\/schema\.org\/AggregateRating">([\s\S]*?)<\/div>/)?.[1];
        const ratingValueMatch = aggregateBlock?.match(/itemprop="ratingValue"\s+content="([\d.]+)"/);
        const ratingCountMatch = aggregateBlock?.match(/itemprop="ratingCount"\s+content="(\d+)"/);

        const rating = ratingValueMatch ? `${ratingValueMatch[1]}/5` : undefined;
        const reviewsCount = ratingCountMatch ? ratingCountMatch[1] : undefined;

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
        // Each review is schema.org Review microdata: splitting on its opening
        // tag gives one chunk per review, each starting right after that tag —
        // exactly what a plain regex needs, since the review's own fields (name,
        // rating, content) all appear before the next review's opening tag.
        const reviewChunks = html.split('<div class="review" itemprop="reviews"').slice(1);
        let translated = 0;
        let skipped = 0;

        for (const chunk of reviewChunks) {
            const contentMatch = chunk.match(/<div class="content">([\s\S]*?)<\/div>/);
            const textBg = contentMatch?.[1].replace(/<[^>]*>/g, "").trim() ?? "";
            if (!textBg || textBg.length < 10) continue;

            const existing = await prisma.superdocReview.findUnique({ where: { textBg } });
            if (existing) { skipped++; continue; }

            // The single itemprop="ratingValue" meta in a review chunk is its
            // overall score; the per-category breakdown (punctuality, manner)
            // is star icons only, with no machine-readable value.
            const ratingAttrMatch = chunk.match(/itemprop="ratingValue"\s+content="(\d)"/);
            const reviewRating = ratingAttrMatch ? parseInt(ratingAttrMatch[1], 10) : null;

            const textEn = await translateToEnglish(textBg);
            translated++;

            await prisma.superdocReview.create({
                data: {
                    textBg,
                    textEn,
                    // Superdoc's own display already anonymizes to first name +
                    // last initial; still generic here rather than plumbing
                    // patient-identifying text through onto the public site.
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
