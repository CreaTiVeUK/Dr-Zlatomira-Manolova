import { prisma } from './prisma';

const PROFILE_URL = 'https://superdoc.bg/lekar/zlatomira-manolova';

async function translateToEnglish(text: string): Promise<string> {
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) return text;

    try {
        const res = await fetch('https://api-free.deepl.com/v2/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                auth_key: apiKey,
                text,
                source_lang: 'BG',
                target_lang: 'EN',
            }),
        });
        if (!res.ok) return text;
        const data = await res.json() as { translations: { text: string }[] };
        return data.translations?.[0]?.text ?? text;
    } catch {
        return text;
    }
}

export async function syncSuperdocReviews() {
    try {
        const response = await fetch(PROFILE_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        if (!response.ok) throw new Error(`Superdoc inaccessible: ${response.status}`);

        const html = await response.text();

        // Extract global rating
        const ratingMatch =
            html.match(/<div[^>]*fontSize:\s*2\.2rem[^>]*>([\d.]+)\/5<\/div>/) ||
            html.match(/<span[^>]*class="rating-value"[^>]*>([\d.]+)<\/span>/);
        const reviewsCountMatch =
            html.match(/(\d+)\s*проверени отзива/) ||
            html.match(/(\d+)\s*verified reviews/);

        const rating = ratingMatch ? `${ratingMatch[1]}/5` : undefined;
        const reviewsCount = reviewsCountMatch ? reviewsCountMatch[1] : undefined;

        if (rating || reviewsCount) {
            await prisma.superdocStat.upsert({
                where: { id: 'singleton' },
                update: {
                    ...(rating && { rating }),
                    ...(reviewsCount && { reviewsCount }),
                },
                create: {
                    id: 'singleton',
                    rating: rating ?? '5.0/5',
                    reviewsCount: reviewsCount ?? '14',
                },
            });
        }

        // Extract individual reviews
        const reviewBlocks = html.match(/<div class="comment-text">([\s\S]*?)<\/div>/g) ?? [];
        let translated = 0;
        let skipped = 0;

        for (const block of reviewBlocks) {
            const textBg = block.replace(/<[^>]*>/g, '').trim();
            if (!textBg || textBg.length < 10) continue;

            // Check if review already exists
            const existing = await prisma.superdocReview.findUnique({ where: { textBg } });
            if (existing) { skipped++; continue; }

            // Translate new review via DeepL
            const textEn = await translateToEnglish(textBg);
            translated++;

            await prisma.superdocReview.create({
                data: {
                    textBg,
                    textEn,
                    authorBg: 'Потвърден пациент',
                    authorEn: 'Verified Patient',
                    rating: 5,
                },
            });
        }

        return {
            success: true,
            rating: rating ?? 'unchanged',
            reviewsCount: reviewsCount ?? 'unchanged',
            newReviews: translated,
            existingReviews: skipped,
        };
    } catch (error: unknown) {
        console.error('Superdoc Sync Error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
