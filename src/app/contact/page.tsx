import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { getSiteUrl } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Контакти и запазване на час",
    description: "Свържете се с д-р Манолова-Пенева в Пловдив. Адрес: А11, кв. „Захари Зограф“, ж.к. Тракия. Тел: +359 88 5557110. Приемни дни вторник, четвъртък и събота. Запазете час онлайн.",
    alternates: { canonical: `${getSiteUrl()}/contact` },
    openGraph: {
      title: "Контакти — Педиатър Пловдив Д-р Манолова-Пенева",
      description: "Адрес, телефон и приемни дни на педиатъра в Пловдив.",
      locale: "bg_BG",
      images: [{ url: "/og-default.jpg", width: 1448, height: 758, alt: "АИПСМП Д-р Манолова-Пенева — Пловдив" }],
    },
  };
}

export default async function ContactPage() {
  const { dict, lang } = await getDictionary();

  return (
    <div className="page-shell page-shell--soft">
      <div className="container">
        {/* Just the badge, no visible title — the map leads — but the page
            still needs one h1. */}
        <header className="page-intro page-intro--center">
          <span className="page-intro__eyebrow">{dict.contact.clinics}</span>
          <h1 className="sr-only">{lang === "bg" ? "Контакти" : "Contact"}</h1>
        </header>

        <div className="contact-layout">
          <div className="stack-lg">
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

            {/* Real photos of the entrance: the frosted door with her name, and the
                covered, step-free approach — what a parent looks for on arrival. */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem" }}>
              <figure style={{ position: "relative", margin: 0, aspectRatio: "3 / 4", borderRadius: "20px", overflow: "hidden" }}>
                <Image src="/photo-entrance.jpg" alt={lang === "bg" ? "Входът на кабинета — витрина с името на д-р Манолова-Пенева" : "Practice entrance — frosted door with Dr. Manolova-Peneva's name"} fill sizes="(max-width: 860px) 50vw, 410px" style={{ objectFit: "cover" }} />
              </figure>
              <figure style={{ position: "relative", margin: 0, aspectRatio: "3 / 4", borderRadius: "20px", overflow: "hidden" }}>
                <Image src="/photo-access.jpg" alt={lang === "bg" ? "Достъп до кабинета — навес и равен вход без стъпала" : "Access to the practice — covered, step-free entrance"} fill sizes="(max-width: 860px) 50vw, 410px" style={{ objectFit: "cover" }} />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
