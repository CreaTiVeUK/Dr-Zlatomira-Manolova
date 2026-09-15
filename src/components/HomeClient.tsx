"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Star } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/en";

interface Testimonial {
  text: string;
  author: string;
}

function ReviewCarousel({ testimonials, lang }: { testimonials: Testimonial[]; lang: "en" | "bg" }) {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const step = isMobile ? 1 : 2;
  const count = testimonials?.length || 0;

  const advance = (dir: 1 | -1) => {
    setIndex((current) => {
      const next = current + dir * step;
      if (next < 0) return Math.max(0, count - step);
      if (next >= count) return 0;
      return next;
    });
  };

  useEffect(() => {
    // Auto-advance is decorative, not the only way to browse reviews (prev/next
    // below always work) — so it stops entirely, rather than just speeding
    // through, whenever reduced motion is requested, and pauses on
    // hover/focus so it never yanks a review out from under a reading user.
    if (count === 0 || paused || reducedMotion) return;
    const timer = setInterval(() => advance(1), 4500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, step, paused, reducedMotion]);

  if (count === 0) return null;

  const visibleReviews = isMobile
    ? [testimonials[index % count]]
    : [testimonials[index % count], testimonials[(index + 1) % count]].filter(Boolean);

  const labels =
    lang === "bg"
      ? { prev: "Предишен отзив", next: "Следващ отзив", pause: "Пауза на превъртането", play: "Пусни превъртането" }
      : { prev: "Previous review", next: "Next review", pause: "Pause auto-advance", play: "Resume auto-advance" };

  return (
    <div
      ref={containerRef}
      style={{ display: "grid", gap: "0.9rem", width: "100%" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) setPaused(false);
      }}
    >
      {visibleReviews.map((rev, i) => (
        <div
          key={`rev-${index}-${i}`}
          className="reveal active"
          style={{
            display: "grid",
            gap: "0.45rem",
            padding: "0.2rem 0",
            animation: reducedMotion ? "none" : "fadeInScale 0.7s ease-out",
          }}
        >
          <p style={{ fontSize: "1rem", color: "var(--text-charcoal)", lineHeight: 1.7 }}>
            &quot;{rev.text}&quot;
          </p>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--primary-teal)",
            }}
          >
            {rev.author}
          </span>
        </div>
      ))}
      {count > step ? (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button type="button" aria-label={labels.prev} onClick={() => advance(-1)} className="review-carousel__btn">
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={paused ? labels.play : labels.pause}
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
            className="review-carousel__btn"
          >
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>
          <button type="button" aria-label={labels.next} onClick={() => advance(1)} className="review-carousel__btn">
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <style jsx>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .review-carousel__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: color-mix(in srgb, var(--surface-card-strong) 76%, transparent 24%);
          color: var(--text-muted);
          cursor: pointer;
        }
        .review-carousel__btn:hover {
          color: var(--primary-teal);
          border-color: color-mix(in srgb, var(--primary-teal) 35%, var(--border) 65%);
        }
      `}</style>
    </div>
  );
}

interface Props {
  dict: Dictionary;
  lang: "en" | "bg";
}

/**
 * Client island for the homepage:
 * - Fetches live trust stats (rating, reviews, testimonials) from /api/trust-stats
 * - Renders the trust bar with ReviewCarousel
 * - Sets up IntersectionObserver for .reveal scroll animations
 */
export default function HomeClient({ dict, lang }: Props) {
  const [trustStats, setTrustStats] = useState<{
    rating: string;
    reviewsCount: string;
    testimonials: Testimonial[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/trust-stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          const testimonials = data.testimonials.map(
            (t: { textEn: string; textBg: string; authorEn: string; authorBg: string }) => ({
              text: lang === "en" ? t.textEn : t.textBg,
              author: lang === "en" ? t.authorEn : t.authorBg,
            }),
          );
          setTrustStats({
            rating: data.rating || dict.home.trust.rating,
            reviewsCount: data.reviewsCount || dict.home.trust.reviewsCount,
            testimonials,
          });
        }
      })
      .catch((err) => console.error("Stats fetch error:", err));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.1 },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [dict.home.trust.rating, dict.home.trust.reviewsCount, lang]);

  const stats = trustStats || {
    rating: dict.home.trust.rating,
    reviewsCount: dict.home.trust.reviewsCount,
    testimonials: dict.home.trust.testimonials,
  };

  return (
    <section className="trust-bar reveal">
      <div className="container">
        <div className="trust-panel">
          <a
            href={dict.home.trust.superdocLink}
            target="_blank"
            rel="noopener noreferrer"
            className="trust-panel__cell"
            title={dict.home.trust.superdocTitle}
          >
            <div>
              <div className="trust-rating">{stats.rating}</div>
              <div className="trust-stars" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} fill="currentColor" />
                ))}
              </div>
            </div>
            <div>
              <div className="trust-label">{dict.home.trust.reviewsLabel}</div>
              <p style={{ marginTop: "0.35rem" }}>{stats.reviewsCount} Superdoc</p>
            </div>
          </a>

          <div className="trust-panel__cell trust-panel__cell--column">
            <div className="trust-label">{dict.home.trust.superdocTitle}</div>
            <ReviewCarousel testimonials={stats.testimonials} lang={lang} />
          </div>

          <div className="trust-panel__cell trust-panel__cell--column">
            <div className="trust-label">{dict.home.trust.partners}</div>
            <div className="partner-logo-grid">
              <a href="https://www.mbal-pz.com" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <Image src="/mbal_logo.png" alt="MBAL Pazardzhik" width={120} height={44} style={{ objectFit: "contain" }} />
              </a>
              <a href={dict.home.trust.superdocLink} target="_blank" rel="noopener noreferrer" className="partner-logo">
                <Image src="/superdoc_logo.svg" alt="Superdoc" width={120} height={44} style={{ objectFit: "contain" }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
