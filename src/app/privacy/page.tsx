import PageIntro from "@/components/PageIntro";
import { getServerLanguage } from "@/lib/i18n/server";
import CookieSettingsButton from "@/components/CookieSettingsButton";

export default async function PrivacyPage() {
  const language = await getServerLanguage();
  const updated = new Date().toLocaleDateString(language === "bg" ? "bg-BG" : "en-GB");

  const copy = language === "bg"
    ? {
        eyebrow: "Поверителност",
        title: "Политика за поверителност",
        subtitle: `Последна актуализация: ${updated}`,
        meta: [
          { title: "Приложимо за", text: "Профили в сайта, резервации, контактни форми и споделени пациентски документи." },
          { title: "Рамка", text: "Обработка на данни в съответствие с GDPR за комуникация с пациенти и управление на часове." },
          { title: "Преглед", text: "Актуализира се при промени в дигиталните услуги, интеграциите или изискванията за съответствие." },
        ],
        sections: {
          introTitle: "1. Въведение",
          introText: "Добре дошли в сайта на АИПСМП по Педиатрия „Д-р Златомира Манолова-Пенева“. Ние се ангажираме да защитаваме личната Ви информация и правото Ви на поверителност. Ако имате въпроси относно тази политика или начина, по който обработваме данни, свържете се с нас.",
          collectTitle: "2. Каква информация събираме",
          collectText: "Събираме лични данни, които доброволно ни предоставяте при регистрация, запитване, записване на час или при друга комуникация с нас.",
          collectList: [
            "Имена",
            "Телефонни номера",
            "Имейл адреси",
            "Предпочитания за контакт",
          ],
          useTitle: "3. Как използваме информацията Ви",
          useText: "Използваме събраните данни за законни бизнес цели, за изпълнение на договорни отношения, с Ваше съгласие и когато това се изисква от закона.",
          useList: [
            "За създаване и поддръжка на потребителски профил.",
            "За изпращане на административна информация.",
            "За управление на резервации и посещения.",
            "За комуникация относно услуги, актуализации и промени.",
          ],
          superdocTitle: "4. Интеграция с трети страни - SuperDoc",
          superdocText: "Възможно е да използваме услуги на SuperDoc.bg за записване на часове, рейтинг и отзиви. При използване на тези функции част от данните Ви може да се обработва съгласно правилата на Superdoc AD.",
          superdocLinkPrefix: "Когато използвате тези функционалности, част от данните Ви може да бъде обработвана съгласно тяхната ",
          superdocLink: "Политика за поверителност",
          cookiesTitle: "5. Бисквитки, анализ и реклама",
          cookiesIntro: "При първото посещение сайтът Ви пита дали приемате бисквитки за анализ и реклама. Докато не отговорите — или ако откажете — не се зареждат инструменти за проследяване и не се поставят такива бисквитки. Ако браузърът Ви изпраща сигнал „Do Not Track“ или „Global Privacy Control“, го третираме като отказ.",
          cookiesList: [
            "Необходими бисквитки — за вход в профила и защита на сесията. Поставят се винаги; без тях сайтът не работи.",
            "Vercel Web Analytics — обобщена статистика за посещенията, без бисквитки и без лични идентификатори. Активира се само след „Приемам“.",
            "Google (Google Ads и Google Analytics 4) — измерва посещения и резултати от рекламни кампании и може да поставя бисквитки като _ga и _gcl_au. Зарежда се само след „Приемам“ и работи в Google Consent Mode v2, така че отказът Ви се предава на Google. Обработката е съгласно политиката за поверителност на Google.",
          ],
          cookiesChange: "Можете да промените избора си по всяко време — банерът ще се покаже отново и всички инструменти ще спрат до нов отговор.",
          cookiesButton: "Промяна на избора за бисквитки",
          rightsTitle: "6. Вашите права по GDPR",
          rightsText: "Ако сте жител на Европейското икономическо пространство или Обединеното кралство, имате право на достъп, корекция, изтриване, ограничаване на обработката и преносимост на данните, когато това е приложимо.",
          contactTitle: "7. Контакт",
          contactText: "При въпроси или коментари относно тази политика, пишете ни на zlatomira.manolova@gmail.com.",
        },
      }
    : {
        eyebrow: "Privacy",
        title: "Privacy Policy",
        subtitle: `Last updated: ${updated}`,
        meta: [
          { title: "Applies to", text: "Website accounts, bookings, contact forms, and shared patient documents." },
          { title: "Framework", text: "GDPR-aligned privacy handling for patient communication and appointment data." },
          { title: "Review cadence", text: "Updated as the clinic's digital services, integrations, or compliance posture change." },
        ],
        sections: {
          introTitle: "1. Introduction",
          introText: "Welcome to the website of Dr. Zlatomira Manolova-Peneva — Paediatric Practice. We are committed to protecting your personal information and your right to privacy. If you have questions about this policy or our data practices, please contact us.",
          collectTitle: "2. Information We Collect",
          collectText: "We collect personal information you voluntarily provide when you register, make an enquiry, book an appointment, or otherwise contact us.",
          collectList: [
            "Names",
            "Phone numbers",
            "Email addresses",
            "Contact preferences",
          ],
          useTitle: "3. How We Use Your Information",
          useText: "We use personal information for legitimate business purposes, to perform our services, with your consent, and where required by law.",
          useList: [
            "To create and maintain your account.",
            "To send administrative updates.",
            "To manage bookings and appointments.",
            "To communicate service changes and relevant follow-up information.",
          ],
          superdocTitle: "4. Integration with Third Parties - SuperDoc",
          superdocText: "We may use services from SuperDoc.bg for appointment scheduling, ratings, or reviews. When these features are used, some of your data may be processed under Superdoc AD policies.",
          superdocLinkPrefix: "When you use these features, some of your data may be processed according to their ",
          superdocLink: "Privacy Policy",
          cookiesTitle: "5. Cookies, Analytics and Advertising",
          cookiesIntro: "On your first visit the site asks whether you accept cookies for analytics and advertising. Until you answer — or if you decline — no tracking tools load and no such cookies are set. A browser Do Not Track or Global Privacy Control signal is treated as a refusal.",
          cookiesList: [
            "Essential cookies — sign-in and session protection. Always set; the site cannot work without them.",
            "Vercel Web Analytics — aggregate visit statistics with no cookies and no personal identifiers. Enabled only after you accept.",
            "Google (Google Ads and Google Analytics 4) — measures visits and advertising campaign results and may set cookies such as _ga and _gcl_au. Loaded only after you accept, and runs under Google Consent Mode v2 so your refusal is passed to Google. Processing is governed by Google's privacy policy.",
          ],
          cookiesChange: "You can change your choice at any time — the banner will appear again and every tool stops until you answer.",
          cookiesButton: "Change cookie settings",
          rightsTitle: "6. Your Privacy Rights (GDPR)",
          rightsText: "If you are located in the European Economic Area or the United Kingdom, you may have rights to access, correct, erase, restrict processing of, or port your personal data where applicable.",
          contactTitle: "7. Contact Us",
          contactText: "If you have questions or comments about this policy, email us at zlatomira.manolova@gmail.com.",
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
              <h2>{copy.sections.introTitle}</h2>
              <p>{copy.sections.introText}</p>
            </section>

            <section>
              <h2>{copy.sections.collectTitle}</h2>
              <p>{copy.sections.collectText}</p>
              <ul>
                {copy.sections.collectList.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2>{copy.sections.useTitle}</h2>
              <p>{copy.sections.useText}</p>
              <ul>
                {copy.sections.useList.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <section>
              <h2>{copy.sections.superdocTitle}</h2>
              <p>{copy.sections.superdocText}</p>
              <p>
                {copy.sections.superdocLinkPrefix}
                <a href="https://superdoc.bg/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary-teal)", textDecoration: "underline" }}>
                  {copy.sections.superdocLink}
                </a>
                .
              </p>
            </section>

            <section>
              <h2>{copy.sections.cookiesTitle}</h2>
              <p>{copy.sections.cookiesIntro}</p>
              <ul>
                {copy.sections.cookiesList.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p>{copy.sections.cookiesChange}</p>
              <CookieSettingsButton label={copy.sections.cookiesButton} />
            </section>

            <section>
              <h2>{copy.sections.rightsTitle}</h2>
              <p>{copy.sections.rightsText}</p>
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
