"use client";

import Link from "next/link";
import Image from "next/image";
import PageIntro from "@/components/PageIntro";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function stripLeadingBullet(value: string) {
  return value.replace(/^[•\-\s]+/, "").trim();
}

export default function ServicesPage() {
  const { dict } = useLanguage();

  return (
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
      </div>
    </div>
  );
}
