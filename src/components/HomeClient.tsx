"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/en";

type Copy = Dictionary["home"]["trust"];
interface Review {
  textEn: string;
  textBg: string;
  authorEn: string;
  authorBg: string;
}
interface TrustStats {
  rating: string | null;
  reviewsCount: string | null;
  testimonials: Review[];
}

function parseStats(value: unknown): TrustStats | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  return {
    rating: typeof data.rating === "string" && data.rating.trim() ? data.rating : null,
    reviewsCount: typeof data.reviewsCount === "string" && data.reviewsCount.trim() ? data.reviewsCount : null,
    testimonials: Array.isArray(data.testimonials) ? data.testimonials.filter((review): review is Review =>
      review && typeof review === "object" &&
      ["textEn", "textBg", "authorEn", "authorBg"].every(key => typeof review[key] === "string" && review[key].trim())
    ) : [],
  };
}

function ReviewCarousel({ reviews, copy, lang }: { reviews: Review[]; copy: Copy; lang: "en" | "bg" }) {
  const [index, setIndex] = useState(0);
  if (!reviews.length) return null;
  const current = index % reviews.length;
  const review = reviews[current];

  return (
    <div className="review-carousel">
      <div aria-live="polite" aria-atomic="true">
        <blockquote>
          <p>“{lang === "en" ? review.textEn : review.textBg}”</p>
          <cite>{lang === "en" ? review.authorEn : review.authorBg}</cite>
        </blockquote>
        <p className="review-carousel__position">
          {copy.position.replace("{current}", new Intl.NumberFormat(lang).format(current + 1)).replace("{total}", new Intl.NumberFormat(lang).format(reviews.length))}
        </p>
      </div>
      {reviews.length > 1 ? (
        <div className="review-carousel__controls">
          <button type="button" aria-label={copy.prev} onClick={() => setIndex((current + reviews.length - 1) % reviews.length)} className="review-carousel__btn">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" aria-label={copy.next} onClick={() => setIndex((current + 1) % reviews.length)} className="review-carousel__btn">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Keep bilingual data so language changes neither refetch nor show stale translations. */
export default function HomeClient({ copy, lang }: { copy: Copy; lang: "en" | "bg" }) {
  const [stats, setStats] = useState<TrustStats | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/trust-stats", { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error("Reviews unavailable");
        return res.json();
      })
      .then(data => { if (!controller.signal.aborted) setStats(parseStats(data)); })
      // The source link stays usable when the request fails or no data exists.
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <section className="trust-bar" aria-labelledby="home-reviews-title">
      <div className="container">
        <h2 id="home-reviews-title" className="section-title">{copy.superdocTitle}</h2>
        <div className="trust-panel">
          <a href={copy.superdocLink} target="_blank" rel="noopener noreferrer" className="trust-panel__cell trust-panel__cell--column">
            {stats?.rating ? <div className="trust-rating">{stats.rating}</div> : null}
            <div className="trust-label">{copy.reviewsLabel}</div>
            {stats?.reviewsCount ? <p>{stats.reviewsCount} Superdoc</p> : null}
            <span className="inline-link">{copy.readReviews}</span>
            <span className="sr-only">{copy.external}</span>
          </a>
          <div className="trust-panel__cell trust-panel__cell--column">
            {stats?.testimonials.length ? (
              <ReviewCarousel reviews={stats.testimonials} copy={copy} lang={lang} />
            ) : (
              <a href={copy.superdocLink} target="_blank" rel="noopener noreferrer" className="card-link">
                {copy.readReviews}<span className="sr-only"> — {copy.external}</span>
              </a>
            )}
          </div>
          <div className="trust-panel__cell trust-panel__cell--column">
            <div className="trust-label">{copy.partners}</div>
            <div className="partner-logo-grid">
              <a href="https://www.mbal-pz.com" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <Image src="/mbal_logo.png" alt={copy.hospital} width={120} height={44} style={{ objectFit: "contain" }} />
                <span className="sr-only"> — {copy.external}</span>
              </a>
              <a href={copy.superdocLink} target="_blank" rel="noopener noreferrer" className="partner-logo">
                <Image src="/superdoc_logo.svg" alt="Superdoc" width={120} height={44} style={{ objectFit: "contain" }} />
                <span className="sr-only"> — {copy.external}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
