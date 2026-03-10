import PageIntro from "@/components/PageIntro";
import { getServerLanguage } from "@/lib/i18n/server";

export default async function TermsPage() {
  const language = await getServerLanguage();
  const updated = new Date().toLocaleDateString(language === "bg" ? "bg-BG" : "en-GB");

  const copy = language === "bg"
    ? {
        eyebrow: "Правни условия",
        title: "Условия за ползване",
        subtitle: `Последна актуализация: ${updated}`,
        meta: [
          { title: "Обхват", text: "Използване на сайта, пациентските профили, резервациите и свързаните услуги на трети страни." },
          { title: "Медицински контекст", text: "Съдържанието подпомага достъпа до грижа, но не заменя директна медицинска преценка или спешна помощ." },
          { title: "Оперативни правила", text: "Часове, анулации и отговорности по профила се уреждат от условията по-долу." },
        ],
        sections: {
          agreementTitle: "1. Приемане на условията",
          agreementText1: "Тези условия представляват правно обвързващо споразумение между Вас и Zlati Pediatrics относно достъпа до сайта и свързаните с него услуги.",
          agreementText2: "С достъпа до сайта потвърждавате, че сте прочели, разбрали и приемате настоящите условия. Ако не сте съгласни с тях, трябва да прекратите използването на сайта.",
          medicalTitle: "2. Медицински отказ от отговорност",
          medicalText1: "Сайтът предоставя информация за педиатричните услуги и позволява онлайн записване. Съдържанието е само с информационна цел и не замества професионален медицински съвет, диагноза или лечение.",
          medicalText2: "Ако смятате, че има спешен медицински случай, незабавно се свържете с лекар или спешна помощ.",
          bookingTitle: "3. Записване и анулации",
          bookingText: "Когато записвате час през сайта, се съгласявате да предоставите точна и пълна информация. Запазваме си правото да отменим или пренасрочим часове при необходимост.",
          bookingList: [
            "Анулации, направени по-малко от 24 часа преди часа, може да подлежат на такса.",
            "Повтарящи се неявявания могат да доведат до ограничения при бъдещи записвания.",
          ],
          thirdPartyTitle: "4. Услуги на трети страни - SuperDoc",
          thirdPartyText1: "Възможно е да използваме платформи на трети страни като SuperDoc за отзиви, рейтинги и управление на часове. Взаимодействието Ви с тези функции се подчинява на условията на съответната платформа.",
          thirdPartyText2: "Не носим отговорност за съдържание, точност или мнения, публикувани в сайтове на трети страни, към които препращаме или интегрираме.",
          userTitle: "5. Регистрация на потребител",
          userText: "Може да се изисква регистрация за достъп до определени функции. Вие носите отговорност за поверителността на паролата си и за всяка активност през профила си.",
          contactTitle: "6. Контакт",
          contactText: "За жалби, въпроси или допълнителна информация относно използването на сайта, пишете ни на terms@zlati-pediatrics.com.",
        },
      }
    : {
        eyebrow: "Legal",
        title: "Terms of Use",
        subtitle: `Last updated: ${updated}`,
        meta: [
          { title: "Scope", text: "Use of the website, patient accounts, bookings, and connected third-party services." },
          { title: "Medical context", text: "Site content supports care access but does not replace direct clinical judgement or emergency care." },
          { title: "Operational rules", text: "Appointments, cancellations, and account responsibilities are governed by the terms below." },
        ],
        sections: {
          agreementTitle: "1. Agreement to Terms",
          agreementText1: "These Terms of Use form a legally binding agreement between you and Zlati Pediatrics regarding access to this website and its related services.",
          agreementText2: "By accessing the site, you confirm that you have read, understood, and agree to these terms. If you do not agree, you must stop using the site immediately.",
          medicalTitle: "2. Medical Disclaimer",
          medicalText1: "The site provides information about pediatric services and supports appointment booking. Its content is informational only and does not replace professional medical advice, diagnosis, or treatment.",
          medicalText2: "If you believe you may have a medical emergency, contact your doctor or emergency services immediately.",
          bookingTitle: "3. Appointment Booking & Cancellations",
          bookingText: "When you book through the site, you agree to provide accurate and complete information. We reserve the right to cancel or reschedule appointments when necessary.",
          bookingList: [
            "Cancellations made less than 24 hours before the appointment time may be subject to a cancellation fee.",
            "Repeated no-shows may result in restrictions on your ability to book future appointments.",
          ],
          thirdPartyTitle: "4. Third-Party Services - SuperDoc",
          thirdPartyText1: "We may use third-party platforms such as SuperDoc for reviews, ratings, and appointment management. Your interaction with those features is governed by their own terms.",
          thirdPartyText2: "We are not responsible for content, accuracy, or opinions expressed on third-party websites linked to or integrated with our site.",
          userTitle: "5. User Registration",
          userText: "You may need to register to access certain features. You are responsible for keeping your password confidential and for all activity under your account.",
          contactTitle: "6. Contact Us",
          contactText: "To resolve a complaint or request further information regarding use of the site, email us at terms@zlati-pediatrics.com.",
        },
      };

  return (
    <div className="legal-shell">
      <div className="container">
        <div className="legal-card">
          <PageIntro
            align="left"
            eyebrow={copy.eyebrow}
            title={copy.title}
            subtitle={copy.subtitle}
            className="page-intro--left"
          />

          <div className="legal-meta-grid">
            {copy.meta.map((item) => (
              <div key={item.title} className="legal-meta-card">
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </div>
            ))}
          </div>

          <div className="legal-prose">
            <section>
              <h2>{copy.sections.agreementTitle}</h2>
              <p>{copy.sections.agreementText1}</p>
              <p>{copy.sections.agreementText2}</p>
            </section>

            <section>
              <h2>{copy.sections.medicalTitle}</h2>
              <p>{copy.sections.medicalText1}</p>
              <p>{copy.sections.medicalText2}</p>
            </section>

            <section>
              <h2>{copy.sections.bookingTitle}</h2>
              <p>{copy.sections.bookingText}</p>
              <ul>
                {copy.sections.bookingList.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2>{copy.sections.thirdPartyTitle}</h2>
              <p>{copy.sections.thirdPartyText1}</p>
              <p>{copy.sections.thirdPartyText2}</p>
            </section>

            <section>
              <h2>{copy.sections.userTitle}</h2>
              <p>{copy.sections.userText}</p>
            </section>

            <section>
              <h2>{copy.sections.contactTitle}</h2>
              <p>{copy.sections.contactText}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
