import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Award, Baby, HeartPulse, MapPin, ShieldCheck, Stethoscope } from "lucide-react";
import HomeClient from "@/components/HomeClient";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Детски лекар Пловдив — Д-р Златомира Манолова | Педиатър",
    description: "Д-р Манолова — педиатър и алерголог в Пловдив. Прегледи за деца 0–18 г., алергологични тестове, грижа за новородени. Запазете час онлайн.",
    alternates: { canonical: "https://zlatipediatrics.com" },
    openGraph: {
      title: "Детски лекар Пловдив — Д-р Манолова",
      description: "Педиатър и алерголог в Пловдив. Прегледи, ваксини, алергии, новородени.",
      locale: "bg_BG",
      images: [{ url: "/hero_premium.png", width: 1200, height: 630, alt: "Д-р Манолова — Детски лекар Пловдив" }],
    },
  };
}

function stripLeadingBullet(value: string) {
  return value.replace(/^[•\-\s]+/, "").trim();
}

const servicesLead = {
  bg: "От профилактични прегледи до специализирана диагностика и неонатална подкрепа.",
  en: "From preventive checkups to specialized diagnostics and newborn support.",
};

export default async function Home() {
  const { dict, lang } = await getDictionary();

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
              <h1 className="hero-subtitle">
                {lang === "bg"
                  ? "Детски лекар в Пловдив — Д-р Златомира Манолова"
                  : "Paediatrician in Plovdiv — Dr. Zlatomira Manolova"}
              </h1>
              <p style={{ marginTop: "0.5rem", opacity: 0.9 }}>{dict.home.hero.subtitle}</p>

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
                <strong>{dict.home.trust.rating}</strong>
                <span>{dict.home.trust.reviewsCount} {lang === "bg" ? "потвърдени отзива" : "verified reviews"}</span>
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

      {/* Client island: live trust stats + ReviewCarousel + IntersectionObserver */}
      <HomeClient dict={dict} lang={lang} />

      <section className="section-padding site-section">
        <div className="container stack-lg">
          <div className="page-intro page-intro--center reveal">
            <span className="page-intro__eyebrow">{dict.home.services.title}</span>
            <div className="page-intro__copy">
              <h2 className="page-intro__title">{dict.home.services.subtitle}</h2>
              <p className="page-intro__subtitle">{servicesLead[lang]}</p>
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
                  background: "linear-gradient(135deg, rgba(15, 76, 129, 0.12), rgba(59, 130, 246, 0.06))",
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
              <Link href="/about" className="btn btn-primary">
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
