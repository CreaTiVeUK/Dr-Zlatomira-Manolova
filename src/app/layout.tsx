import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-main",
  display: "swap",
});

const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Детски лекар Пловдив — Д-р Златомира Манолова-Пенева | Педиатър",
    template: "%s | Д-р Манолова-Пенева",
  },
  description: "Частен педиатър в Пловдив. Д-р Златомира Манолова-Пенева — специалист педиатрия, детска алергология, грижа за новородени. Кабинет в кв. Тракия. Запазете час онлайн.",
  keywords: [
    "педиатър Пловдив", "детски лекар Пловдив", "д-р Манолова-Пенева", "д-р Манолова", "частен педиатър",
    "детска алергология Пловдив", "грижа за новородени Пловдив", "детски специалист Пловдив",
    "pediatrician Plovdiv", "pediatric specialist Bulgaria",
  ],
  openGraph: {
    title: "Детски лекар Пловдив — Д-р Златомира Манолова-Пенева",
    description: "Частен педиатър в Пловдив. Детска алергология, спешна педиатрия, грижа за новородени. Запазете час онлайн.",
    siteName: "Педиатрия Манолова-Пенева",
    images: [{ url: "/og-default.jpg", width: 1024, height: 536, alt: "Д-р Манолова-Пенева — Педиатър Пловдив" }],
    locale: "bg_BG",
    type: "website",
    url: SITE_URL,
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: { index: true, follow: true },
};

// ─── Structured data ──────────────────────────────────────────────────────────
// One graph for the whole site: the clinic and the doctor, linked by stable
// @id values that other pages reference instead of re-declaring the entities.
// Everything here must match what the pages visibly say. No aggregateRating:
// Google disregards LocalBusiness ratings the business publishes about itself,
// and the old fallback fabricated "5.0 / 14" whenever the database was down.

const PRACTICE_ID = `${SITE_URL}/#practice`;
const DOCTOR_ID = `${SITE_URL}/#doctor`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalClinic",
      "@id": PRACTICE_ID,
      // Identical to the Google Business Profile name — Google cross-checks them.
      "name": "АИПСМП по Педиатрия „Д-р Златомира Манолова-Пенева“",
      "alternateName": [
        "АИПСМП „Д-р Златомира Манолова-Пенева“",
        "Manolova-Peneva Pediatrics", "Педиатрия Манолова-Пенева",
        // Short forms patients actually search for and older references use.
        "Manolova Pediatrics", "Педиатрия Манолова", "Д-р Златомира Манолова",
      ],
      "url": SITE_URL,
      "logo": `${SITE_URL}/logo.jpg`,
      "image": `${SITE_URL}/logo.jpg`,
      "description": "Частна педиатрична практика в Пловдив. Специализирана помощ за деца от 0 до 18 години — обща педиатрия, детска алергология, грижа за новородени.",
      "telephone": "+359885557110",
      "email": "zlatomira.manolova@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "А11, кв. „Захари Зограф“, ж.к. Тракия",
        "addressLocality": "Пловдив",
        "addressRegion": "Пловдивска област",
        "postalCode": "4000",
        "addressCountry": "BG",
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 42.136959,
        "longitude": 24.790681,
      },
      "areaServed": [
        { "@type": "City", "name": "Пловдив" },
        { "@type": "AdministrativeArea", "name": "Пловдивска област" },
      ],
      "medicalSpecialty": "https://schema.org/Pediatric",
      "inLanguage": ["bg", "en"],
      // Must stay identical to CLINIC_SCHEDULE (clinic-hours.ts) and the footer.
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": "Tuesday", "opens": "14:00", "closes": "18:00" },
        { "@type": "OpeningHoursSpecification", "dayOfWeek": "Thursday", "opens": "09:00", "closes": "18:00" },
        { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "14:00" },
      ],
      "hasMap": "https://maps.google.com/maps?q=42.136959,24.790681",
      "sameAs": ["https://superdoc.bg/lekar/zlatomira-manolova"],
      "employee": { "@id": DOCTOR_ID },
    },
    {
      "@type": "Physician",
      "@id": DOCTOR_ID,
      "name": "Д-р Златомира Манолова-Пенева",
      "givenName": "Златомира",
      "familyName": "Манолова-Пенева",
      "honorificPrefix": "Д-р",
      "image": `${SITE_URL}/dr_manolova.jpg`,
      "jobTitle": "Педиатър; началник на Второ педиатрично отделение, МБАЛ Пазарджик",
      "description": "Специалист педиатрия, завършила МУ Пловдив (2018), специалност (2023). Началник отделение от 2025 г. Носител на отличие „Ти си нашето бъдеще“ от БЛС.",
      "medicalSpecialty": "https://schema.org/Pediatric",
      "knowsAbout": ["Педиатрия", "Детска алергология", "Грижа за новородени", "Спешна педиатрия"],
      "worksFor": { "@id": PRACTICE_ID },
      "hospitalAffiliation": {
        "@type": "Hospital",
        "name": "МБАЛ Пазарджик",
        "url": "https://mbal-pz.com",
        "address": { "@type": "PostalAddress", "addressLocality": "Пазарджик", "addressCountry": "BG" },
      },
      "url": `${SITE_URL}/about`,
      "alumniOf": {
        "@type": "EducationalOrganization",
        "name": "Медицински университет – Пловдив",
      },
      "award": "Ти си нашето бъдеще — Български лекарски съюз (2023)",
      "memberOf": [
        { "@type": "Organization", "name": "Българска педиатрична асоциация" },
        { "@type": "Organization", "name": "Български лекарски съюз" },
      ],
      "sameAs": [
        "https://superdoc.bg/lekar/zlatomira-manolova",
        "https://pediatria-bg.eu/д-р-златомира-манолова-пенева-педиа/",
      ],
    },
  ],
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmergencyBanner from "@/components/EmergencyBanner";
import CookieConsent from "@/components/CookieConsent";
import ConsentedAnalytics from "@/components/ConsentedAnalytics";
import { getSession } from "@/lib/auth";
import { Providers } from "@/components/Providers";
import { getSiteUrl } from "@/lib/site-url";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, cookieStore] = await Promise.all([getSession(), cookies()]);
  const user = session?.user || null;
  const lang = cookieStore.get("language")?.value === "en" ? "en" : "bg";

  return (
    <html lang={lang} className={`${montserrat.variable} ${openSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <Providers initialLanguage={lang}>
          <a href="#main-content" className="skip-link">
            Skip to content
          </a>
          <EmergencyBanner />
          <Header user={user} />
          <main id="main-content" className="site-main">
            {children}
          </main>
          <Footer />
          <CookieConsent />
          <ConsentedAnalytics />
        </Providers>
      </body>
    </html>
  );
}
