import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Baby } from "lucide-react";
import PageIntro from "@/components/PageIntro";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Педиатър за Новородено Пловдив | Неонатална Грижа — Д-р Манолова",
    description: "Специализирана грижа за новородени в Пловдив — жълтеница, колики, хранене, проследяване на развитието. Д-р Манолова, неонатолог и педиатър. Запазете час.",
    alternates: { canonical: "https://zlatipediatrics.com/services/newborn" },
    openGraph: {
      title: "Педиатър за Новородено Пловдив — Д-р Манолова",
      description: "Жълтеница, колики, хранене и ранно развитие — грижа за новородени в Пловдив.",
      locale: "bg_BG",
    },
  };
}

function stripLeadingBullet(value: string) {
  return value.replace(/^[•\-\s]+/, "").trim();
}

export default async function NewbornPage() {
  const { dict, lang } = await getDictionary();

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: lang === "bg" ? "Неонатална педиатрична грижа" : "Neonatal & newborn paediatric care",
    description: dict.home.services.newborn.desc,
    provider: {
      "@type": "Physician",
      name: "Д-р Златомира Манолова-Пенева",
      url: "https://zlatipediatrics.com",
    },
    location: {
      "@type": "MedicalClinic",
      name: "МЦ 'Д-р Златомира Манолова'",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Пловдив",
        postalCode: "4023",
        addressCountry: "BG",
      },
    },
  };

  const faqItems =
    lang === "bg"
      ? [
          {
            q: "Кога трябва да запазим първи преглед на новороденото?",
            a: "Препоръчва се първи педиатричен преглед в рамките на 3–5 дни след изписване от родилното. Д-р Манолова приема новородени от 0 дни.",
          },
          {
            q: "Каква е нормалната жълтеница при новородено?",
            a: "Физиологичната жълтеница обикновено се появява на 2–3 ден и преминава до 2-та седмица. При съмнение за патологична жълтеница е необходим незабавен преглед.",
          },
          {
            q: "Колко често трябва да се храни новороденото?",
            a: "Новородените обикновено се хранят на всеки 2–3 часа (8–12 пъти за 24 часа). Д-р Манолова предоставя индивидуален съвет при консултация.",
          },
          {
            q: "Какво е включено в профилактичните прегледи на кърмачето?",
            a: "Прегледите включват измерване на тегло и ръст, оценка на развитието, ваксинации по националния имунизационен календар и съвети за хранене и сън.",
          },
        ]
      : [
          {
            q: "When should we book the first newborn check?",
            a: "A first paediatric check is recommended within 3–5 days of discharge from hospital. Dr. Manolova accepts newborns from day 0.",
          },
          {
            q: "What is normal jaundice in a newborn?",
            a: "Physiological jaundice typically appears on day 2–3 and resolves by week 2. If pathological jaundice is suspected, an urgent appointment is needed.",
          },
          {
            q: "How often should a newborn feed?",
            a: "Newborns typically feed every 2–3 hours (8–12 times per 24 hours). Dr. Manolova provides individualised feeding advice at consultation.",
          },
          {
            q: "What is included in routine infant checks?",
            a: "Checks include weight and length measurement, developmental assessment, vaccinations on the national immunisation schedule, and feeding and sleep guidance.",
          },
        ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const newbornConditions = dict.conditions.neonatal.list;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="page-shell page-shell--soft">
        <div className="container">
          <PageIntro
            eyebrow={lang === "bg" ? "СПЕЦИАЛИЗИРАНА УСЛУГА" : "SPECIALIST SERVICE"}
            title={dict.home.services.newborn.title}
            subtitle={dict.home.services.newborn.desc}
          />

          <div className="stack-lg">
            <article className="service-row">
              <div
                className="service-media"
                style={{
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg, rgba(15, 76, 129, 0.12), rgba(59, 130, 246, 0.06))",
                }}
              >
                <Baby size={96} color="var(--primary-teal)" />
              </div>
              <div className="service-copy">
                <span className="page-intro__eyebrow">
                  {lang === "bg" ? "КАКВО ВКЛЮЧВА УСЛУГАТА" : "WHAT'S INCLUDED"}
                </span>
                <h2>
                  {lang === "bg"
                    ? "Специализирана грижа от 0 до 12 месеца"
                    : "Specialist care from birth to 12 months"}
                </h2>
                <p>{dict.home.services.newborn.desc}</p>
                <ul>
                  {[
                    lang === "bg" ? "Преглед на новородено (от 0 дни)" : "Newborn examination (from day 0)",
                    lang === "bg" ? "Мониторинг на жълтеница" : "Jaundice monitoring",
                    lang === "bg" ? "Подкрепа при хранене — кърмене и адаптирано мляко" : "Feeding support — breastfeeding and formula",
                    lang === "bg" ? "Оценка на растеж и развитие" : "Growth and developmental assessment",
                    lang === "bg" ? "Профилактични прегледи и ваксини (0–12 м.)" : "Preventive checks and vaccines (0–12 months)",
                    lang === "bg" ? "Консултация при колики и нарушения на съня" : "Colic and sleep disorder consultation",
                  ].map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <Link href="/book" className="btn btn-primary">
                  {dict.home.hero.bookBtn}
                </Link>
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

            {/* Image */}
            <div style={{ position: "relative", height: "320px", borderRadius: "1rem", overflow: "hidden" }}>
              <Image
                src="/service_general_paediatrics_1769272814052.png"
                alt={lang === "bg" ? "Грижа за новородено" : "Newborn care"}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            {/* FAQ */}
            <div className="sidebar-card">
              <h2 style={{ marginBottom: "1.25rem" }}>
                {lang === "bg" ? "Въпроси и отговори" : "Frequently asked questions"}
              </h2>
              <div className="faq-list">
                {faqItems.map((item, i) => (
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

          <nav aria-label="Свързани услуги" style={{ marginTop: "3rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/services" className="btn btn-outline">
              ← {lang === "bg" ? "Всички услуги" : "All services"}
            </Link>
            <Link href="/services/allergy" className="btn btn-outline">
              {lang === "bg" ? "Детска алергология →" : "Paediatric allergy →"}
            </Link>
            <Link href="/book" className="btn btn-primary">
              {dict.home.hero.bookBtn}
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
