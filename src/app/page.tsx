import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Award, Baby, HeartPulse, MapPin, Stethoscope } from "lucide-react";
import HomeClient from "@/components/HomeClient";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSiteUrl } from "@/lib/site-url";
import { getSession } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: "Детски лекар Пловдив — Д-р Златомира Манолова-Пенева | Педиатър" },
    description: "Д-р Манолова-Пенева — педиатър в Пловдив. Прегледи за деца 0–18 г., грижа за новородени, профилактични прегледи. Запазете час онлайн.",
    alternates: { canonical: getSiteUrl() },
    openGraph: {
      title: "Детски лекар Пловдив — Д-р Манолова-Пенева",
      description: "Педиатър в Пловдив. Прегледи, новородени, профилактика, съвети за ваксини.",
      locale: "bg_BG",
      images: [{ url: "/og-default.jpg", width: 1448, height: 758, alt: "Д-р Манолова-Пенева — Детски лекар Пловдив" }],
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
  const [{ dict, lang }, session] = await Promise.all([getDictionary(), getSession()]);
  // /book needs an account; never send an anonymous visitor into a redirect.
  const bookHref = session?.user ? "/book" : "/login?callbackUrl=%2Fbook";

  return (
    <div>
      <section className="hero-section">
        <Image
          src="/photo-waiting-room.jpg"
          alt={dict.home.heroImageAlt}
          fill
          style={{ objectFit: "cover", opacity: 0.52 }}
          priority
        />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-content reveal">
            {/* Only credentials she holds. The template's UK letters (MBBS,
                MRCPCH, FRCP…) sat here on the live site until 2026-09-09. */}
            <div className="clinical-badge">
              <Award size={14} />
              {lang === "bg"
                ? "Специалист по педиатрия · Началник отделение"
                : "Paediatric specialist · Head of department"}
            </div>

            <div className="hero-copy-block">
              <h1 className="hero-subtitle">
                {lang === "bg"
                  ? "Грижа за детското здраве в Пловдив – от първите дни до юношеството"
                  : "Children's health care in Plovdiv – from the first days to adolescence"}
              </h1>
              <p style={{ marginTop: "0.5rem", opacity: 0.9 }}>{dict.home.hero.subtitle}</p>

              <div className="hero-actions">
                <Link href={bookHref} className="btn btn-primary">
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
                {/* A schedule chip sat here — logistics, not a trust signal, and
                    thin next to the other two cards' credentials. This is her
                    one verified award not yet represented in the trust bar. */}
                <Award size={18} color="white" />
                <strong>{lang === "bg" ? "„Ти си нашето бъдеще“" : "“You are our future”"}</strong>
                <span>{lang === "bg" ? "Номинация от Българския лекарски съюз (2023)" : "Bulgarian Medical Association nomination (2023)"}</span>
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
            <div className="page-intro__copy">
              <h2 className="page-intro__title">{dict.home.services.title}</h2>
              <p className="page-intro__subtitle">{servicesLead[lang]}</p>
            </div>
          </div>

          <div className="card-grid">
            <article className="premium-card reveal delay-1">
              <div className="service-media" style={{ minHeight: "240px" }}>
                <Image
                  src="/photo-consulting-room.jpg"
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
              <Link href="/services#newborn" className="btn btn-primary">
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
              <Link href={bookHref} className="btn btn-outline">
                {dict.home.hero.bookBtn}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
