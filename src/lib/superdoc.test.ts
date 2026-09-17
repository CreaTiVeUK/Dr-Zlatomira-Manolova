// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    statUpsert: vi.fn(),
    reviewFindUnique: vi.fn(),
    reviewCreate: vi.fn(),
}));
vi.mock("./prisma", () => ({
    prisma: {
        superdocStat: { upsert: mocks.statUpsert },
        superdocReview: { findUnique: mocks.reviewFindUnique, create: mocks.reviewCreate },
    },
}));
import { syncSuperdocReviews } from "./superdoc";

// Trimmed to the fields the scraper reads, but otherwise the real markup
// Superdoc serves — schema.org Review/AggregateRating microdata, not the old
// "comment-text" class layout this scraper was originally written against.
function page(reviews: string) {
    return `
        <div itemprop="aggregateRating" itemscope itemtype="http://schema.org/AggregateRating">
            <meta itemprop="ratingValue" content="4.9">
            <meta itemprop="ratingCount" content="20">
        </div>
        <div id="doctor-reviews-wrap">${reviews}</div>
    `;
}

function review({ name = "Севда Ш.", rating = "5", content }: { name?: string; rating?: string; content?: string }) {
    const contentDiv = content !== undefined ? `<div class="content">${content}</div>` : "";
    return `
        <div class="review" itemprop="reviews" itemscope itemtype="http://schema.org/Review">
            <div class="review-name">
                <span itemscope itemprop="author" itemtype="http://schema.org/Person">
                    <span itemprop="name">${name}</span>
                </span>
                <span class="text-muted" itemprop="datePublished">3 септември 2026</span>
            </div>
            <div class="review-score" itemprop="reviewRating" itemscope itemtype="http://schema.org/Rating">
                <meta itemprop="ratingValue" content="${rating}">
                <meta itemprop="worstRating" content="1">
                <meta itemprop="bestRating" content="5">
            </div>
            ${contentDiv}
        </div>
    `;
}

beforeEach(() => {
    vi.clearAllMocks();
    mocks.reviewFindUnique.mockResolvedValue(null);
    global.fetch = vi.fn();
});
afterEach(() => {
    vi.unstubAllGlobals();
});

describe("syncSuperdocReviews", () => {
    it.each(["ratingValue", "ratingCount"])("preserves stored metrics when %s is missing", async (missing) => {
        const html = page(review({ content: "Много добър лекар, препоръчвам!" }))
            .replace(new RegExp(`<meta itemprop="${missing}" content="[^\"]+">`), "");
        vi.mocked(fetch).mockResolvedValue(new Response(html, { status: 200 }));

        const result = await syncSuperdocReviews();

        expect(result.success).toBe(true);
        expect(mocks.statUpsert).not.toHaveBeenCalled();
        expect(mocks.reviewCreate).toHaveBeenCalledTimes(1);
    });

    it("extracts the aggregate rating and review text from schema.org microdata", async () => {
        const html = page(
            review({ content: "Много добър лекар, препоръчвам!" }) +
            review({ name: "Иван П.", rating: "4", content: "Добро отношение към децата." })
        );
        vi.mocked(fetch).mockResolvedValue(new Response(html, { status: 200 }));

        const result = await syncSuperdocReviews();

        expect(result).toMatchObject({ success: true, rating: "4.9/5", reviewsCount: "20", newReviews: 2, existingReviews: 0 });
        expect(mocks.statUpsert).toHaveBeenCalledWith(expect.objectContaining({
            create: expect.objectContaining({ rating: "4.9/5", reviewsCount: "20" }),
        }));
        expect(mocks.reviewCreate).toHaveBeenCalledTimes(2);
        expect(mocks.reviewCreate).toHaveBeenNthCalledWith(1, expect.objectContaining({
            data: expect.objectContaining({ textBg: "Много добър лекар, препоръчвам!", rating: 5 }),
        }));
        expect(mocks.reviewCreate).toHaveBeenNthCalledWith(2, expect.objectContaining({
            data: expect.objectContaining({ textBg: "Добро отношение към децата.", rating: 4 }),
        }));
    });

    it("skips rating-only reviews that have no written content", async () => {
        const html = page(review({ content: undefined }) + review({ content: "Написан отзив." }));
        vi.mocked(fetch).mockResolvedValue(new Response(html, { status: 200 }));

        const result = await syncSuperdocReviews();

        expect(result.newReviews).toBe(1);
        expect(mocks.reviewCreate).toHaveBeenCalledTimes(1);
        expect(mocks.reviewCreate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ textBg: "Написан отзив." }),
        }));
    });

    it("skips reviews already stored, and never fabricates a rating it could not parse", async () => {
        mocks.reviewFindUnique.mockResolvedValueOnce({ id: "existing" });
        const html = page(
            review({ content: "Вече запазен отзив." }) +
            `<div class="review" itemprop="reviews" itemscope itemtype="http://schema.org/Review">
                <div class="content">Отзив без рейтинг маркиране.</div>
            </div>`
        );
        vi.mocked(fetch).mockResolvedValue(new Response(html, { status: 200 }));

        const result = await syncSuperdocReviews();

        expect(result).toMatchObject({ newReviews: 1, existingReviews: 1 });
        expect(mocks.reviewCreate).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ textBg: "Отзив без рейтинг маркиране.", rating: null }),
        }));
    });

    it("fails closed on a non-2xx response instead of wiping existing data", async () => {
        vi.mocked(fetch).mockResolvedValue(new Response("blocked", { status: 403 }));

        const result = await syncSuperdocReviews();

        expect(result.success).toBe(false);
        expect(mocks.statUpsert).not.toHaveBeenCalled();
        expect(mocks.reviewCreate).not.toHaveBeenCalled();
    });

    it("reports a timeout distinctly from other fetch failures", async () => {
        vi.mocked(fetch).mockImplementation(() => {
            const err = new Error("aborted");
            err.name = "AbortError";
            return Promise.reject(err);
        });

        const result = await syncSuperdocReviews();

        expect(result).toMatchObject({ success: false, error: expect.stringContaining("timed out") });
    });
});
