import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Baby } from "lucide-react";
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

  const newbornServiceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: lang === "bg" ? "Неонатална педиатрична грижа" : "Neonatal & newborn paediatric care",
    description: dict.home.services.newborn.desc,
    provider: { "@id": `${getSiteUrl()}/#practice` },
    areaServed: { "@type": "City", name: "Пловдив" },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${getSiteUrl()}/contact`,
      servicePhone: { "@type": "ContactPoint", telephone: "+359885557110", contactType: "reservations" },
    },
  };

  const newbornFaqItems =
    lang === "bg"
      ? [
          {
            q: "Кога трябва да запазим първи преглед на новороденото?",
            a: "Препоръчва се първи педиатричен преглед в рамките на 3–5 дни след изписване от родилното. Д-р Манолова-Пенева приема новородени от 0 дни.",
          },
          {
            q: "Каква е нормалната жълтеница при новородено?",
            a: "Физиологичната жълтеница обикновено се появява на 2–3 ден и преминава до 2-та седмица. При съмнение за патологична жълтеница е необходим незабавен преглед.",
          },
          {
            q: "Колко често трябва да се храни новороденото?",
            a: "Новородените обикновено се хранят на всеки 2–3 часа (8–12 пъти за 24 часа). Д-р Манолова-Пенева предоставя индивидуален съвет при консултация.",
          },
          {
            q: "Какво е включено в профилактичните прегледи на кърмачето?",
            a: "Прегледите включват измерване на тегло и ръст, оценка на развитието, консултация по националния имунизационен календар и съвети за хранене и сън.",
          },
        ]
      : [
          {
            q: "When should we book the first newborn check?",
            a: "A first paediatric check is recommended within 3–5 days of discharge from hospital. Dr. Manolova-Peneva accepts newborns from day 0.",
          },
          {
            q: "What is normal jaundice in a newborn?",
            a: "Physiological jaundice typically appears on day 2–3 and resolves by week 2. If pathological jaundice is suspected, an urgent appointment is needed.",
          },
          {
            q: "How often should a newborn feed?",
            a: "Newborns typically feed every 2–3 hours (8–12 times per 24 hours). Dr. Manolova-Peneva provides individualised feeding advice at consultation.",
          },
          {
            q: "What is included in routine infant checks?",
            a: "Checks include weight and length measurement, developmental assessment, advice on the national immunisation schedule, and feeding and sleep guidance.",
          },
        ];

  const newbornFaqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: newbornFaqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const newbornConditions = dict.conditions.neonatal.list;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newbornServiceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newbornFaqSchema) }} />
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
              <Link href="/contact" className="btn btn-primary">
                {dict.servicesPage.general.btn}
              </Link>
            </div>
          </article>

          {/* Newborn care — merged into this page rather than a separate
              /services/newborn route (see next.config.ts redirect). */}
          <article className="service-row service-row-reverse" id="newborn" style={{ scrollMarginTop: "7rem" }}>
            <div className="order-2-mobile service-copy">
              <span className="page-intro__eyebrow">
                {lang === "bg" ? "КАКВО ВКЛЮЧВА УСЛУГАТА" : "WHAT'S INCLUDED"}
              </span>
              <h2>{dict.home.services.newborn.title}</h2>
              <p>{dict.home.services.newborn.desc}</p>
              <ul>
                {[
                  lang === "bg" ? "Преглед на новородено (от 0 дни)" : "Newborn examination (from day 0)",
                  lang === "bg" ? "Мониторинг на жълтеница" : "Jaundice monitoring",
                  lang === "bg" ? "Подкрепа при хранене — кърмене и адаптирано мляко" : "Feeding support — breastfeeding and formula",
                  lang === "bg" ? "Оценка на растеж и развитие" : "Growth and developmental assessment",
                  lang === "bg" ? "Профилактични прегледи и съвети за ваксини (0–12 м.)" : "Preventive checks and vaccine advice (0–12 months)",
                  lang === "bg" ? "Консултация при колики и нарушения на съня" : "Colic and sleep disorder consultation",
                ].map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <Link href="/contact" className="btn btn-primary">
                {dict.home.hero.bookBtn}
              </Link>
            </div>
            <div
              className="order-1-mobile service-media"
              style={{
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, rgba(15, 76, 129, 0.12), rgba(59, 130, 246, 0.06))",
              }}
            >
              <Baby size={96} color="var(--primary-teal)" />
            </div>
          </article>

          {/* Neonatal conditions */}
          <div className="premium-card">
            <h2 style={{ marginBottom: "1rem" }}>
              {lang === "bg" ? "Чести неонатални състояния" : "Common neonatal conditions"}
            </h2>
            <ul className="list-checked">
              {newbornConditions.map((item, i) => (
                <li key={i}>{stripLeadingBullet(item)}</li>
              ))}
            </ul>
          </div>

          <div style={{ position: "relative", height: "320px", borderRadius: "1rem", overflow: "hidden" }}>
            <Image
              src="/photo-height-chart.jpg"
              alt={lang === "bg" ? "Ростомер на вратата на кабинета — проследяване на растежа" : "Growth chart on the practice door — tracking development"}
              fill
              style={{ objectFit: "cover", objectPosition: "68% 60%" }}
            />
          </div>

          {/* Newborn FAQ */}
          <div className="sidebar-card">
            <h2 style={{ marginBottom: "1.25rem" }}>
              {lang === "bg" ? "Въпроси и отговори за новородени" : "Newborn care — frequently asked questions"}
            </h2>
            <div className="faq-list">
              {newbornFaqItems.map((item, i) => (
                <div key={i} className="faq-item">
                  <div style={{ fontWeight: 700, marginBottom: "0.35rem", color: "var(--text-charcoal)" }}>
                    {item.q}
                  </div>
                  <p>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
