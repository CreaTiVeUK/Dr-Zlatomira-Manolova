import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageIntro from "@/components/PageIntro";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "За д-р Манолова | Педиатър и Алерголог Пловдив",
    description: "Д-р Златомира Манолова-Пенева — педиатър и алерголог в Пловдив. Началник на Второ педиатрично отделение в МБАЛ Пазарджик. Специалист по детска алергология.",
    alternates: { canonical: "https://zlatipediatrics.com/about" },
    openGraph: {
      title: "Д-р Златомира Манолова — Педиатър Пловдив",
      description: "Биография, квалификации и опит на д-р Манолова, детски лекар в Пловдив.",
      locale: "bg_BG",
      images: [{ url: "/dr_manolova.jpg", width: 1200, height: 630, alt: "Д-р Златомира Манолова — Педиатър Пловдив" }],
    },
  };
}

function stripLeadingBullet(value: string) {
  return value.replace(/^[•\-\s]+/, "").trim();
}

export default async function AboutPage() {
  const { dict, lang } = await getDictionary();

  const physicianSchema = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": "https://zlatipediatrics.com/#doctor",
    name: "Д-р Златомира Манолова-Пенева",
    jobTitle: lang === "bg" ? "Педиатър и Алерголог" : "Paediatrician & Allergologist",
    description: dict.home.about.bio1,
    award: "Ти си нашето бъдеще — БЛС (2023)",
    worksFor: {
      "@type": "MedicalOrganization",
      name: "МЦ 'Д-р Златомира Манолова'",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Пловдив",
        postalCode: "4023",
        addressCountry: "BG",
      },
    },
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Медицински университет Пловдив",
    },
    knowsAbout: ["Педиатрия", "Детска алергология", "Неонатология", "Спешна педиатрия"],
    url: "https://zlatipediatrics.com/about",
    sameAs: ["https://superdoc.bg/lekar/zlatomira-manolova"],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "bg" ? "Начало" : "Home", item: "https://zlatipediatrics.com" },
      { "@type": "ListItem", position: 2, name: lang === "bg" ? "За д-р Манолова" : "About Dr. Manolova", item: "https://zlatipediatrics.com/about" },
    ],
  };

  const pressLinks = [
    {
      title: lang === "bg"
        ? "Педиатрията не се побира в учебници, тя се живее"
        : "Paediatrics cannot fit in textbooks — it is lived",
      outlet: "Педиатрия плюс • 2025",
      href: "https://pediatria-bg.eu/д-р-златомира-манолова-пенева-педиа/",
    },
    {
      title: lang === "bg"
        ? "Хуманност и изкуство в педиатрията"
        : "Humanity and art in paediatrics",
      outlet: "Darik News • 2024",
      href: "https://darik.bg/osmoklasnici-preobraziha-steni-vav-vtoro-detsko-otdelenie-na-mbal-pazardzik",
    },
    {
      title: lang === "bg"
        ? "Назначение за Началник на Второ отделение"
        : "Appointed Head of Second Paediatric Ward",
      outlet: "МБАЛ Пазарджик • 2023",
      href: "https://www.mbal-pz.com/home/685-%D0%B4-%D1%80-%D0%B7-%D0%BC%D0%B0%D0%BD%D0%BE%D0%BB%D0%BE%D0%B2%D0%B0-%D0%B4%D0%B5%D1%86%D0%B0%D1%82%D0%B0-%D0%B8%D0%BC%D0%B0%D1%82-%D1%81%D0%BF%D0%B5%D1%86%D0%B8%D1%84%D0%B8%D1%87%D0%B5%D0%BD-%D0%B7%D0%B0%D1%80%D1%8F%D0%B4-%D0%BA%D0%BE%D0%B9%D1%82%D0%BE-%D0%BC%D0%B5-%D0%BC%D0%BE%D1%82%D0%B2%D0%B8%D1%80%D0%B0-%D0%B4%D0%B0-%D1%81%D1%8A%D0%BC-%D0%B4%D0%B5%D1%82%D1%81%D0%BA%D0%B8-%D0%BB%D0%B5%D0%BA%D0%B0%D1%80",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(physicianSchema) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="page-shell page-shell--soft">
        <div className="container">
          <PageIntro
            eyebrow={dict.home.about.badge}
            title={dict.home.about.name}
            subtitle={dict.home.about.role}
          />

          <div className="about-grid" style={{ marginBottom: "4rem" }}>
            <div className="about-image">
              <Image
                src="/dr_manolova.jpg"
                alt={dict.home.about.imageAlt}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            <div className="surface-card surface-card--elevated about-copy">
              <span className="page-intro__eyebrow">
                {lang === "bg" ? "БИОГРАФИЯ" : "BIOGRAPHY"}
              </span>
              <p>{dict.home.about.bio1}</p>
              <p>{dict.home.about.bio2}</p>
              <p>{dict.home.about.bio3}</p>
              <p>{dict.home.about.bio4}</p>

              <div className="qual-grid">
                <div className="qual-card">
                  <h2 style={{ fontSize: "1rem" }}>{dict.home.about.qualifications}</h2>
                  <ul className="list-checked">
                    {dict.home.about.qualList.map((item, i) => (
                      <li key={i}>{stripLeadingBullet(item)}</li>
                    ))}
                  </ul>
                </div>
                <div className="qual-card">
                  <h2 style={{ fontSize: "1rem" }}>{dict.home.about.specialties}</h2>
                  <ul className="list-checked">
                    {dict.home.about.specList.map((item, i) => (
                      <li key={i}>{stripLeadingBullet(item)}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="btn-group">
                <Link href="/book" className="btn btn-primary">
                  {dict.home.hero.bookBtn}
                </Link>
                <Link href="/contact" className="btn btn-outline">
                  {dict.header.nav.contact}
                </Link>
              </div>
            </div>
          </div>

          {/* Press & recognition */}
          <section style={{ marginBottom: "4rem" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>
              {lang === "bg" ? "В медиите и академичната общност" : "Press & recognition"}
            </h2>
            <div className="article-list">
              {pressLinks.map((item) => (
                <article key={item.href} className="article-card">
                  <div className="article-card__meta">{item.outlet}</div>
                  <h3>{item.title}</h3>
                  <div className="article-card__footer">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--primary-teal)", fontWeight: 700 }}
                    >
                      {lang === "bg" ? "ПРОЧЕТЕТЕ →" : "READ →"}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="surface-card surface-card--accent" style={{ textAlign: "center", padding: "3rem 2rem" }}>
            <h2 style={{ marginBottom: "0.75rem" }}>
              {lang === "bg" ? "Запазете час при д-р Манолова" : "Book an appointment with Dr. Manolova"}
            </h2>
            <p style={{ marginBottom: "1.5rem", opacity: 0.9 }}>
              {lang === "bg"
                ? "Прегледи за деца 0–18 г. в Пловдив и Пазарджик."
                : "Consultations for children aged 0–18 in Plovdiv and Pazardzhik."}
            </p>
            <Link href="/book" className="btn btn-primary">
              {dict.home.hero.bookBtn}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
