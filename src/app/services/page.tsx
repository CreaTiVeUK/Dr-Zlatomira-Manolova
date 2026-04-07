import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageIntro from "@/components/PageIntro";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Педиатрични услуги Пловдив | Алергология, Новородени, Спешна педиатрия",
    description: "Пълен спектър от педиатрични услуги в Пловдив — детска алергология, кожно-алергични тестове, грижа за новородени, профилактични прегледи. Д-р Манолова.",
    alternates: { canonical: "https://zlatipediatrics.com/services" },
    openGraph: {
      title: "Педиатрични услуги в Пловдив — Д-р Манолова",
      description: "Детска алергология, спешна педиатрия, грижа за новородени и профилактични прегледи в Пловдив.",
      locale: "bg_BG",
      images: [{ url: "/service_general_paediatrics_1769272814052.png", width: 1200, height: 630, alt: "Педиатрични услуги Пловдив" }],
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
      { "@type": "ListItem", position: 1, name: lang === "bg" ? "Начало" : "Home", item: "https://zlatipediatrics.com" },
      { "@type": "ListItem", position: 2, name: lang === "bg" ? "Услуги" : "Services", item: "https://zlatipediatrics.com/services" },
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
                src="/service_general_paediatrics_1769272814052.png"
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

          <article className="service-row service-row-reverse">
            <div className="service-copy order-1-mobile">
              <span className="page-intro__eyebrow">{dict.home.services.allergy.title}</span>
              <h2>{dict.servicesPage.allergy.title}</h2>
              <p>{dict.servicesPage.allergy.desc}</p>
              <ul>
                {dict.servicesPage.allergy.list.map((item, i) => (
                  <li key={i}>{stripLeadingBullet(item)}</li>
                ))}
              </ul>
              <Link href="/book" className="btn btn-outline">
                {dict.servicesPage.allergy.btn}
              </Link>
            </div>
            <div className="service-media order-2-mobile">
              <Image
                src="/service_allergy_consultation_1769272828650.png"
                alt={dict.servicesPage.allergy.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </article>
        </div>

        {/* Sub-service links for internal SEO navigation */}
        <nav aria-label="Специализирани услуги" style={{ marginTop: "3rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/services/allergy" className="btn btn-outline">
            {dict.servicesPage.allergy.title} →
          </Link>
          <Link href="/services/newborn" className="btn btn-outline">
            {dict.home.services.newborn.title} →
          </Link>
        </nav>
      </div>
    </div>
    </>
  );
}
