import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import PageIntro from "@/components/PageIntro";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Детски Алерголог Пловдив | Алергологични Тестове — Д-р Манолова",
    description: "Детски алерголог в Пловдив. Кожно-алергични тестове (резултати в същия ден), лечение на астма, хранителни алергии и екзема при деца. Д-р Манолова.",
    alternates: { canonical: "https://zlatipediatrics.com/services/allergy" },
    openGraph: {
      title: "Детски Алерголог Пловдив — Д-р Манолова",
      description: "Кожно-алергични тестове, астма, хранителни алергии и екзема при деца в Пловдив.",
      locale: "bg_BG",
    },
  };
}

function stripLeadingBullet(value: string) {
  return value.replace(/^[•\-\s]+/, "").trim();
}

export default async function AllergyPage() {
  const { dict, lang } = await getDictionary();

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: lang === "bg" ? "Детска алергология — кожно-алергични тестове" : "Paediatric allergy testing",
    description: dict.servicesPage.allergy.desc,
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
            q: "На каква възраст може да се прави алергологичен тест при деца?",
            a: "Кожно-алергичните тестове могат да се извършват при деца от 2-годишна възраст. При малки деца д-р Манолова може да препоръча кръвен тест (специфични IgE антитела) като алтернатива.",
          },
          {
            q: "Колко трае алергологичният преглед?",
            a: "Прегледът с кожни тестове отнема около 60–90 минути. Резултатите се отчитат на място в рамките на 20 минути.",
          },
          {
            q: "Трябва ли детето да спре антихистамини преди теста?",
            a: "Да — антихистамините трябва да се спрат минимум 5–7 дни преди кожните тестове. Д-р Манолова ще даде конкретни инструкции при запазването на час.",
          },
          {
            q: "Лекуват ли се хранителни алергии?",
            a: "Д-р Манолова разработва индивидуален план за управление, включващ диета, спешни протоколи и при необходимост — имунотерапия.",
          },
        ]
      : [
          {
            q: "At what age can allergy testing be done?",
            a: "Skin prick tests can be performed from age 2. For younger children, Dr. Manolova may recommend a blood test (specific IgE) as an alternative.",
          },
          {
            q: "How long does an allergy appointment take?",
            a: "An appointment with skin testing takes around 60–90 minutes. Results are read on-site within 20 minutes.",
          },
          {
            q: "Does my child need to stop antihistamines before testing?",
            a: "Yes — antihistamines must be stopped at least 5–7 days before skin prick tests. Dr. Manolova will provide specific instructions when booking.",
          },
          {
            q: "Can food allergies be treated?",
            a: "Dr. Manolova develops an individualised management plan including dietary guidance, emergency protocols, and immunotherapy where appropriate.",
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="page-shell page-shell--soft">
        <div className="container">
          <PageIntro
            eyebrow={lang === "bg" ? "СПЕЦИАЛИЗИРАНА УСЛУГА" : "SPECIALIST SERVICE"}
            title={dict.servicesPage.allergy.title}
            subtitle={dict.servicesPage.allergy.desc}
          />

          <div className="stack-lg">
            <article className="service-row">
              <div className="service-media">
                <Image
                  src="/service_allergy_consultation_1769272828650.png"
                  alt={dict.servicesPage.allergy.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="service-copy">
                <span className="page-intro__eyebrow">
                  {lang === "bg" ? "КАКВО ВКЛЮЧВА УСЛУГАТА" : "WHAT'S INCLUDED"}
                </span>
                <h2>
                  {lang === "bg"
                    ? "Диагностика и лечение на детски алергии"
                    : "Paediatric allergy diagnosis & management"}
                </h2>
                <p>{dict.servicesPage.allergy.desc}</p>
                <ul>
                  {dict.servicesPage.allergy.list.map((item, i) => (
                    <li key={i}>{stripLeadingBullet(item)}</li>
                  ))}
                </ul>
                <Link href="/book" className="btn btn-primary">
                  {dict.servicesPage.allergy.btn}
                </Link>
              </div>
            </article>

            {/* Conditions treated */}
            <div className="premium-card">
              <h2 style={{ marginBottom: "1rem" }}>
                {lang === "bg" ? "Алергични заболявания, с които работим" : "Allergic conditions we treat"}
              </h2>
              <ul className="list-checked">
                {dict.conditions.allergy.list.map((item, i) => (
                  <li key={i}>{stripLeadingBullet(item)}</li>
                ))}
                {dict.conditions.respiratory.list.map((item, i) => (
                  <li key={i}>{stripLeadingBullet(item)}</li>
                ))}
              </ul>
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
            <Link href="/services/newborn" className="btn btn-outline">
              {lang === "bg" ? "Грижа за новородени →" : "Newborn care →"}
            </Link>
            <Link href="/conditions" className="btn btn-outline">
              {dict.header.nav.conditions} →
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
