import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import PageIntro from "@/components/PageIntro";
import ContactFormClient from "@/components/ContactFormClient";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSession } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Контакти и запазване на час",
    description: "Свържете се с д-р Манолова-Пенева в Пловдив. Адрес: А11, кв. „Захари Зограф“, ж.к. Тракия. Тел: +359 88 5557110. Приемни дни вторник, четвъртък и събота. Запазете час онлайн.",
    alternates: { canonical: `${getSiteUrl()}/contact` },
    openGraph: {
      title: "Контакти — Педиатър Пловдив Д-р Манолова-Пенева",
      description: "Адрес, телефон и форма за контакт с педиатъра в Пловдив.",
      locale: "bg_BG",
      images: [{ url: "/og-default.jpg", width: 1448, height: 758, alt: "АИПСМП Д-р Манолова-Пенева — Пловдив" }],
    },
  };
}

export default async function ContactPage() {
  const [{ dict, lang }, session] = await Promise.all([getDictionary(), getSession()]);

  // Consultation days used to have their own card here too — dropped as a
  // duplicate of the footer's Working Hours card, which already covers it
  // (with the actual times, not just the day abbreviations).
  const introCards =
    lang === "bg"
      ? [
          { value: "0–18 г.", label: "възраст на пациентите" },
          { value: "кв. Тракия", label: "Пловдив" },
        ]
      : [
          { value: "0–18", label: "patient age range" },
          { value: "Trakiya", label: "Plovdiv" },
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
                      </p>
                      {/* A parent with a sick child phones: the number itself is the
                          primary, full-width tap target. Email goes through the form,
                          so no mailbox address sits on the page. */}
                      <a href="tel:+359885557110" className="btn btn-primary contact-phone">
                        <Phone size={20} aria-hidden="true" />
                        {dict.footer.phone}
                      </a>
                      <div className="contact-item__actions">
                        <a href="#contact-form" className="btn btn-outline">
                          <Mail size={16} />
                          {lang === "bg" ? "Пишете ни" : "Write to us"}
                        </a>
                        {/* The map below is an embed, so this is the only way a
                            parent can open turn-by-turn navigation — and the
                            only way a directions click can be measured. */}
                        <a
                          href="https://www.google.com/maps/dir/?api=1&destination=42.136959,24.790681"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                        >
                          <MapPin size={16} />
                          {lang === "bg" ? "Навигация" : "Directions"}
                        </a>
                      </div>
                    </div>
                    <span className="contact-item__icon" aria-hidden="true">
                      <Phone size={18} />
                    </span>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-item__layout">
                    <div className="stack-md" style={{ gap: "0.5rem" }}>
                      <span className="clinical-badge">
                        <MapPin size={14} />
                        {dict.contact.partnerHospital}
                      </span>
                      <p>{dict.contact.addressSecond}</p>
                    </div>
                    <span className="contact-item__icon" aria-hidden="true">
                      <MapPin size={18} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="surface-card surface-card--accent">
              <h3 style={{ marginBottom: "0.65rem" }}>{dict.contact.admin.title}</h3>
              <p>{dict.contact.admin.text}</p>
              <div className="contact-item__actions">
                {/* /book needs an account; never send an anonymous visitor into a redirect. */}
                {session?.user ? (
                  <Link href="/book" className="btn btn-primary">
                    {lang === "bg" ? "Онлайн записване" : "Book online"}
                  </Link>
                ) : (
                  <Link href="/login?callbackUrl=%2Fbook" className="btn btn-outline">
                    {lang === "bg" ? "Вход за онлайн записване" : "Sign in to book online"}
                  </Link>
                )}
              </div>
            </div>

            {/* Real photos of the entrance: the frosted door with her name, and the
                covered, step-free approach — what a parent looks for on arrival. */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              <figure style={{ position: "relative", margin: 0, aspectRatio: "3 / 4", borderRadius: "20px", overflow: "hidden" }}>
                <Image src="/photo-entrance.jpg" alt={lang === "bg" ? "Входът на кабинета — витрина с името на д-р Манолова-Пенева" : "Practice entrance — frosted door with Dr. Manolova-Peneva's name"} fill sizes="(max-width: 640px) 100vw, 50vw" style={{ objectFit: "cover" }} />
              </figure>
              <figure style={{ position: "relative", margin: 0, aspectRatio: "3 / 4", borderRadius: "20px", overflow: "hidden" }}>
                <Image src="/photo-access.jpg" alt={lang === "bg" ? "Достъп до кабинета — навес и равен вход без стъпала" : "Access to the practice — covered, step-free entrance"} fill sizes="(max-width: 640px) 100vw, 50vw" style={{ objectFit: "cover" }} />
              </figure>
            </div>

            <div className="map-card">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d554.7573179751803!2d24.790733567012644!3d42.13684288262581!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14acd1d75a275eaf%3A0x72238a6c53395303!2z0JDQmNCf0KHQnNCfINC_0L4g0J_QtdC00LjQsNGC0YDQuNGPIOKAntCULdGAINCX0LvQsNGC0L7QvNC40YDQsCDQnNCw0L3QvtC70L7QstCwLdCf0LXQvdC10LLQsOKAnA!5e0!3m2!1sen!2sus!4v1789462438393!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title={dict.contact.clinics}
              ></iframe>
            </div>
          </div>

          <div id="contact-form">
            <ContactFormClient dict={dict} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
