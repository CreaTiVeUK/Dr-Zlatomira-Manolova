import type { Metadata } from "next";
import PageIntro from "@/components/PageIntro";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Детски болести и лечение в Пловдив",
    description: "Лечение на астма, хранителни алергии, рефлукс, висока температура и повече при деца в Пловдив. Д-р Манолова-Пенева — педиатър специалист. Запазете час.",
    alternates: { canonical: `${getSiteUrl()}/conditions` },
    openGraph: {
      title: "Детски болести и лечение — Педиатър Пловдив",
      description: "Астма, алергии, гастро, неонатални и спешни педиатрични заболявания. Лечение в Пловдив при д-р Манолова-Пенева.",
      locale: "bg_BG",
      images: [{ url: "/og-default.jpg", width: 1024, height: 536, alt: "Детски болести и лечение Пловдив" }],
    },
  };
}

function stripLeadingBullet(value: string) {
  return value.replace(/^[•\-\s]+/, "").trim();
}

export default async function ConditionsPage() {
  const { dict, lang } = await getDictionary();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "bg" ? "Начало" : "Home", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: lang === "bg" ? "Заболявания" : "Conditions", item: `${getSiteUrl()}/conditions` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="page-shell page-shell--soft">
      <div className="container">
        <PageIntro
          eyebrow={dict.header.nav.conditions}
          title={dict.conditions.title}
          subtitle={dict.conditions.subtitle}
        />

        <div className="card-grid">
          <div className="premium-card">
            <h2>{dict.conditions.respiratory.title}</h2>
            <ul className="list-checked">
              {dict.conditions.respiratory.list.map((item, i) => <li key={i}>{stripLeadingBullet(item)}</li>)}
            </ul>
          </div>
          <div className="premium-card">
            <h2>{dict.conditions.gastro.title}</h2>
            <ul className="list-checked">
              {dict.conditions.gastro.list.map((item, i) => <li key={i}>{stripLeadingBullet(item)}</li>)}
            </ul>
          </div>
          <div className="premium-card">
            <h2>{dict.conditions.allergy.title}</h2>
            <ul className="list-checked">
              {dict.conditions.allergy.list.map((item, i) => <li key={i}>{stripLeadingBullet(item)}</li>)}
            </ul>
          </div>
          <div className="premium-card">
            <h2>{dict.conditions.neonatal.title}</h2>
            <ul className="list-checked">
              {dict.conditions.neonatal.list.map((item, i) => <li key={i}>{stripLeadingBullet(item)}</li>)}
            </ul>
          </div>
          <div className="premium-card">
            <h2>{dict.conditions.general.title}</h2>
            <ul className="list-checked">
              {dict.conditions.general.list.map((item, i) => <li key={i}>{stripLeadingBullet(item)}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
