"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/en";

interface Testimonial {
  text: string;
  author: string;
}

function ReviewCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const step = isMobile ? 1 : 2;
  const count = testimonials?.length || 0;

  useEffect(() => {
    if (count === 0) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + step >= count ? 0 : current + step));
    }, 4500);
    return () => clearInterval(timer);
  }, [count, step]);

  if (count === 0) return null;

  const visibleReviews = isMobile
    ? [testimonials[index % count]]
    : [testimonials[index % count], testimonials[(index + 1) % count]].filter(Boolean);

  return (
    <div style={{ display: "grid", gap: "0.9rem", width: "100%" }}>
      {visibleReviews.map((rev, i) => (
        <div
          key={`rev-${index}-${i}`}
          className="reveal active"
          style={{
            display: "grid",
            gap: "0.45rem",
            padding: "0.2rem 0",
            animation: "fadeInScale 0.7s ease-out",
          }}
        >
          <p style={{ fontSize: "0.96rem", color: "var(--text-charcoal)", lineHeight: 1.7 }}>
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
      <style jsx>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
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
            <ReviewCarousel testimonials={stats.testimonials} />
          </div>

          <div className="trust-panel__cell trust-panel__cell--column">
            <div className="trust-label">{dict.home.trust.partners}</div>
            <div className="partner-logo-grid">
              <a href="https://www.mbal-pz.com" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <Image src="/mbal_logo.png" alt="MBAL Pazardzhik" width={120} height={44} style={{ objectFit: "contain" }} />
              </a>
              <a href="https://plovdimed.com" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <Image src="/plovdimed_logo.png" alt="Plovdimed" width={120} height={44} style={{ objectFit: "contain" }} />
              </a>
              <a href="https://superdoc.bg/lekar/zlatomira-manolova" target="_blank" rel="noopener noreferrer" className="partner-logo">
                <Image src="/superdoc_logo.svg" alt="Superdoc" width={120} height={44} style={{ objectFit: "contain" }} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
