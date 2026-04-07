import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Съвети за родители и ЧЗВ | Педиатър Пловдив — Д-р Манолова",
    description: "Експертни педиатрични съвети, ЧЗВ и статии от д-р Манолова. Температура при бебета, ваксини, алергии, хранене — практични отговори за родители.",
    alternates: { canonical: "https://zlatipediatrics.com/resources" },
    openGraph: {
      title: "Педиатрични съвети и ЧЗВ — Д-р Манолова Пловдив",
      description: "Практични съвети и отговори на чести въпроси от педиатър в Пловдив.",
      locale: "bg_BG",
      images: [{ url: "/dr_manolova.jpg", width: 1200, height: 630, alt: "Педиатрични съвети от д-р Манолова" }],
    },
  };
}

export default async function ResourcesPage() {
  const { dict, lang } = await getDictionary();

  const introMetrics = [
    { value: `${dict.resources.articles.length}`, label: dict.resources.latest },
    { value: `${dict.resources.faq.items.length}`, label: dict.resources.faq.title },
    { value: "24/7", label: dict.resources.cta.title },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: dict.resources.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "bg" ? "Начало" : "Home", item: "https://zlatipediatrics.com" },
      { "@type": "ListItem", position: 2, name: lang === "bg" ? "Ресурси" : "Resources", item: "https://zlatipediatrics.com/resources" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="page-shell page-shell--soft">
        <div className="container">
          <PageIntro
            eyebrow={dict.header.nav.resources}
            title={dict.resources.title}
            subtitle={dict.resources.subtitle}
            actions={
              <div className="meta-grid" style={{ width: "100%" }}>
                {introMetrics.map((item) => (
                  <div key={item.label} className="meta-card">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            }
          />

          <div className="resource-layout">
            <div>
              <div className="resource-panel-header">
                <div>
                  <h2>{dict.resources.latest}</h2>
                  <p>{dict.resources.subtitle}</p>
                </div>
                <Link href="/book" className="btn btn-primary">
                  {dict.header.nav.book}
                </Link>
              </div>
              <div className="article-list">
                {dict.resources.articles.map((resource, i) => (
                  <article key={i} className="article-card">
                    <div className="article-card__meta">{resource.category}</div>
                    <h3>{resource.title}</h3>
                    <p>{resource.excerpt}</p>
                    <div className="article-card__footer">
                      <Link
                        href={resource.link || "/resources/article"}
                        target={resource.link ? "_blank" : "_self"}
                        rel={resource.link ? "noopener noreferrer" : undefined}
                        style={{ color: "var(--primary-teal)", fontWeight: 700 }}
                      >
                        {dict.resources.readArticle}
                      </Link>
                      <span>5 min read</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="sidebar-stack">
              <div className="sidebar-card">
                <h3 style={{ marginBottom: "1.1rem" }}>{dict.resources.faq.title}</h3>
                <div className="faq-list">
                  {dict.resources.faq.items.map((item, i) => (
                    <div key={i} className="faq-item">
                      <div style={{ fontWeight: 700, marginBottom: "0.35rem", color: "var(--text-charcoal)" }}>{item.q}</div>
                      <p>{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sidebar-card sidebar-card--accent">
                <h3 style={{ marginBottom: "0.8rem" }}>{dict.resources.cta.title}</h3>
                <p style={{ marginBottom: "1rem", opacity: 0.92 }}>{dict.resources.cta.text}</p>
                <Link
                  href="/contact"
                  className="btn btn-outline"
                  style={{
                    background: "rgba(255,255,255,0.14)",
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    width: "100%",
                  }}
                >
                  {dict.resources.cta.btn}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
