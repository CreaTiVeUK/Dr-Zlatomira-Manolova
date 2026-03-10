"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Award,
  Baby,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Testimonial {
  text: string;
  author: string;
}

function stripLeadingBullet(value: string) {
  return value.replace(/^[•\-\s]+/, "").trim();
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
    <div
      style={{
        display: "grid",
        gap: "0.9rem",
        width: "100%",
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
            animation: "fadeInScale 0.7s ease-out",
          }}
        >
          <p
            style={{
              fontSize: "0.96rem",
              color: "var(--text-charcoal)",
              lineHeight: 1.7,
            }}
          >
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
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const { dict, language } = useLanguage();
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
              text: language === "en" ? t.textEn : t.textBg,
              author: language === "en" ? t.authorEn : t.authorBg,
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
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [dict.home.trust.rating, dict.home.trust.reviewsCount, language]);

  const stats = trustStats || {
    rating: dict.home.trust.rating,
    reviewsCount: dict.home.trust.reviewsCount,
    testimonials: dict.home.trust.testimonials,
  };

  const homeCopy =
    language === "bg"
      ? {
          reviews: "потвърдени отзива",
          servicesLead:
            "От профилактични прегледи до специализирана диагностика и неонатална подкрепа.",
        }
      : {
          reviews: "verified reviews",
          servicesLead:
            "From preventive checkups to specialized diagnostics and newborn support.",
        };

  return (
    <div>
      <section className="hero-section">
        <Image
          src="/hero_premium.png"
          alt={dict.home.heroImageAlt}
          fill
          style={{ objectFit: "cover", opacity: 0.52 }}
          priority
        />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-content reveal">
            <div className="clinical-badge">
              <Award size={14} />
              MBBS, DCH, MRCPCH, FRCP
            </div>

            <div className="hero-copy-block">
              <h1 className="hero-title">
                {dict.home.hero.title}
                <br />
                <span style={{ color: "#9ed3ff" }}>{dict.home.hero.titleHighlight}</span>
              </h1>

              <p className="hero-subtitle">{dict.home.hero.subtitle}</p>

              <div className="hero-actions">
                <Link href="/book" className="btn btn-primary">
                  {dict.home.hero.bookBtn}
                </Link>
                <Link
                  href="/services"
                  className="btn btn-outline"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.18)",
                    color: "white",
                  }}
                >
                  {dict.home.hero.servicesBtn}
                </Link>
              </div>
            </div>

            <div className="hero-trust-grid">
              <div className="hero-trust-card">
                <ShieldCheck size={18} color="white" />
                <strong>{stats.rating}</strong>
                <span>{stats.reviewsCount} {homeCopy.reviews}</span>
              </div>
              <div className="hero-trust-card">
                <Stethoscope size={18} color="white" />
                <strong>{dict.home.about.role}</strong>
                <span>{dict.home.about.badge}</span>
              </div>
              <div className="hero-trust-card">
                <MapPin size={18} color="white" />
                <strong>{dict.contact.medicalCenter}</strong>
                <span>{dict.footer.addressMain}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section className="section-padding site-section">
        <div className="container stack-lg">
          <div className="page-intro page-intro--center reveal">
            <span className="page-intro__eyebrow">{dict.home.services.title}</span>
            <div className="page-intro__copy">
              <h2 className="page-intro__title">{dict.home.services.subtitle}</h2>
              <p className="page-intro__subtitle">{homeCopy.servicesLead}</p>
            </div>
          </div>

          <div className="card-grid">
            <article className="premium-card reveal delay-1">
              <div className="service-media" style={{ minHeight: "240px" }}>
                <Image
                  src="/service_general_paediatrics_1769272814052.png"
                  alt={dict.home.services.general.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="icon-badge">
                <HeartPulse size={18} />
              </div>
              <h3>{dict.home.services.general.title}</h3>
              <p>{dict.home.services.general.desc}</p>
              <Link href="/services" className="btn btn-outline">
                {dict.home.services.general.btn}
              </Link>
            </article>

            <article className="premium-card reveal delay-2">
              <div className="service-media" style={{ minHeight: "240px" }}>
                <Image
                  src="/service_allergy_consultation_1769272828650.png"
                  alt={dict.home.services.allergy.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="icon-badge">
                <ShieldCheck size={18} />
              </div>
              <h3>{dict.home.services.allergy.title}</h3>
              <p>{dict.home.services.allergy.desc}</p>
              <Link href="/services" className="btn btn-outline">
                {dict.home.services.allergy.btn}
              </Link>
            </article>

            <article className="premium-card reveal delay-3">
              <div
                className="service-media"
                style={{
                  minHeight: "240px",
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(135deg, rgba(15, 76, 129, 0.12), rgba(59, 130, 246, 0.06))",
                }}
              >
                <Baby size={76} color="var(--primary-teal)" />
              </div>
              <div className="icon-badge">
                <Baby size={18} />
              </div>
              <h3>{dict.home.services.newborn.title}</h3>
              <p>{dict.home.services.newborn.desc}</p>
              <Link href="/services" className="btn btn-primary">
                {dict.home.services.newborn.btn}
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section-padding bg-soft site-section reveal" id="about">
        <div className="container about-grid">
          <div className="about-image">
            <Image
              src="/dr_manolova.jpg"
              alt={dict.home.about.imageAlt}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>

          <div className="surface-card surface-card--elevated about-copy">
            <span className="page-intro__eyebrow">{dict.home.about.badge}</span>
            <h2 className="page-intro__title" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)" }}>
              {dict.home.about.name}
            </h2>
            <p style={{ fontSize: "1.05rem", color: "var(--text-charcoal)", fontWeight: 600 }}>
              {dict.home.about.role}
            </p>
            <p>{dict.home.about.bio1}</p>
            <p>{dict.home.about.bio2}</p>
            <p>{dict.home.about.bio3}</p>
            <p>{dict.home.about.bio4}</p>

            <div className="qual-grid">
              <div className="qual-card">
                <h4>{dict.home.about.qualifications}</h4>
                <ul className="list-checked">
                  {dict.home.about.qualList.map((item, i) => (
                    <li key={i}>{stripLeadingBullet(item)}</li>
                  ))}
                </ul>
              </div>
              <div className="qual-card">
                <h4>{dict.home.about.specialties}</h4>
                <ul className="list-checked">
                  {dict.home.about.specList.map((item, i) => (
                    <li key={i}>{stripLeadingBullet(item)}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="btn-group">
              <Link href="/contact" className="btn btn-primary">
                {dict.home.about.bioBtn}
              </Link>
              <Link href="/book" className="btn btn-outline">
                {dict.home.hero.bookBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
