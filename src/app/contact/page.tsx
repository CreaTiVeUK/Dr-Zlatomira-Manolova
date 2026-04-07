import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import PageIntro from "@/components/PageIntro";
import ContactFormClient from "@/components/ContactFormClient";
import { getDictionary } from "@/lib/i18n/getDictionary";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Контакти | Педиатър Пловдив — Д-р Манолова",
    description: "Свържете се с д-р Манолова в Пловдив. Адрес: Ж.К. Тракия, А11, кв. Захари Зограф 52Б. Тел: +359 88 5557110. Запазете час онлайн.",
    alternates: { canonical: "https://zlatipediatrics.com/contact" },
    openGraph: {
      title: "Контакти — Педиатър Пловдив Д-р Манолова",
      description: "Адрес, телефон и форма за контакт с педиатъра в Пловдив.",
      locale: "bg_BG",
    },
  };
}

export default async function ContactPage() {
  const { dict, lang } = await getDictionary();

  const introCards =
    lang === "bg"
      ? [
          { value: "24ч", label: "обичаен отговор" },
          { value: "2", label: "локации за преглед" },
          { value: "6 дни", label: "седмично обслужване" },
        ]
      : [
          { value: "24h", label: "typical response" },
          { value: "2", label: "clinic locations" },
          { value: "6 days", label: "weekly coverage" },
        ];

  return (
    <div className="page-shell page-shell--soft">
      <div className="container">
        <PageIntro
          eyebrow={dict.contact.clinics}
          title={dict.contact.title}
          subtitle={dict.contact.subtitle}
          actions={
            <div className="meta-grid" style={{ width: "100%" }}>
              {introCards.map((item) => (
                <div key={item.label} className="meta-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          }
        />

        <div className="contact-layout">
          <div className="stack-lg">
            <div className="contact-panel stack-md">
              <h2>{dict.contact.clinics}</h2>

              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-item__layout">
                    <div className="stack-md" style={{ gap: "0.5rem" }}>
                      <span className="clinical-badge">
                        <MapPin size={14} />
                        {dict.contact.medicalCenter}
                      </span>
                      <p>
                        {dict.contact.addressMain}
                        <br />
                        <strong>{dict.contact.tel}:</strong> {dict.footer.phone}
                        <br />
                        <strong>{dict.contact.email}:</strong> zlatomira.manolova@gmail.com
                      </p>
                      <div className="contact-item__actions">
                        <Link href={`tel:${dict.footer.phone}`} className="btn btn-outline">
                          <Phone size={16} />
                          {dict.contact.tel}
                        </Link>
                        <Link href="mailto:zlatomira.manolova@gmail.com" className="btn btn-primary">
                          <Mail size={16} />
                          {dict.contact.email}
                        </Link>
                      </div>
                    </div>
                    <span className="contact-item__icon" aria-hidden="true">
                      <Mail size={18} />
                    </span>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item__layout">
                    <div className="stack-md" style={{ gap: "0.5rem" }}>
                      <span className="clinical-badge">
                        <Phone size={14} />
                        {dict.contact.partnerHospital}
                      </span>
                      <p>
                        {dict.contact.addressSecond}
                        <br />
                        <strong>{dict.contact.tel}:</strong> {dict.footer.phone}
                      </p>
                      <div className="contact-item__actions">
                        <Link href={`tel:${dict.footer.phone}`} className="btn btn-outline">
                          <Phone size={16} />
                          {lang === "bg" ? "Обади се" : "Call now"}
                        </Link>
                      </div>
                    </div>
                    <span className="contact-item__icon" aria-hidden="true">
                      <Phone size={18} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-card surface-card--accent">
              <h3 style={{ marginBottom: "0.65rem" }}>{dict.contact.admin.title}</h3>
              <p>{dict.contact.admin.text}</p>
              <div className="contact-item__actions">
                <Link href="/book" className="btn btn-primary">
                  {dict.header.nav.book}
                </Link>
              </div>
            </div>

            <div className="map-card">
              <iframe
                src="https://maps.google.com/maps?q=42.136959,24.790681&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={dict.contact.clinics}
              ></iframe>
            </div>
          </div>

          <ContactFormClient dict={dict} lang={lang} />
        </div>
      </div>
    </div>
  );
}
