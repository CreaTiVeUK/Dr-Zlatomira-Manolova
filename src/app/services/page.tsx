import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageIntro from "@/components/PageIntro";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Педиатрични услуги в Пловдив",
    description: "Пълен спектър от педиатрични услуги в Пловдив — спешна и обща педиатрия, грижа за новородени, профилактични прегледи. Д-р Манолова-Пенева.",
    alternates: { canonical: `${getSiteUrl()}/services` },
    openGraph: {
      title: "Педиатрични услуги в Пловдив — Д-р Манолова-Пенева",
      description: "Спешна и обща педиатрия, грижа за новородени и профилактични прегледи в Пловдив.",
      locale: "bg_BG",
      images: [{ url: "/og-default.jpg", width: 1448, height: 758, alt: "Педиатрични услуги Пловдив" }],
    },
  };
}

function stripLeadingBullet(value: string) {
  return value.replace(/^[•\-\s]+/, "").trim();
}

export default async function ServicesPage() {
  const { dict, lang } = await getDictionary();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "bg" ? "Начало" : "Home", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: lang === "bg" ? "Услуги" : "Services", item: `${getSiteUrl()}/services` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="page-shell page-shell--soft">
      <div className="container">
        <PageIntro
          eyebrow={dict.home.services.title}
          title={dict.servicesPage.title}
          subtitle={dict.servicesPage.subtitle}
        />

        <div className="stack-lg">
          <article className="service-row">
            <div className="service-media">
              <Image
                src="/photo-exam-couch.jpg"
                alt={dict.servicesPage.general.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="service-copy">
              <span className="page-intro__eyebrow">{dict.home.services.general.title}</span>
              <h2>{dict.servicesPage.general.title}</h2>
              <p>{dict.servicesPage.general.desc}</p>
              <ul>
                {dict.servicesPage.general.list.map((item, i) => (
                  <li key={i}>{stripLeadingBullet(item)}</li>
                ))}
              </ul>
              <Link href="/book" className="btn btn-primary">
                {dict.servicesPage.general.btn}
              </Link>
            </div>
          </article>
        </div>

        {/* Sub-service links for internal SEO navigation */}
        <nav aria-label="Специализирани услуги" style={{ marginTop: "3rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/services/newborn" className="btn btn-outline">
            {dict.home.services.newborn.title} →
          </Link>
        </nav>
      </div>
    </div>
    </>
  );
}
