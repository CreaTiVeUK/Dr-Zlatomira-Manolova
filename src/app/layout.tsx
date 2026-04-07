import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
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

const SITE_URL = "https://zlatipediatrics.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Детски лекар Пловдив — Д-р Златомира Манолова | Педиатър",
    template: "%s | Д-р Манолова — Педиатър Пловдив",
  },
  description: "Частен педиатър в Пловдив. Д-р Златомира Манолова — специалист педиатрия, детска алергология, грижа за новородени. МЦ кв. Тракия. Запазете час онлайн.",
  keywords: [
    "педиатър Пловдив", "детски лекар Пловдив", "д-р Манолова", "частен педиатър",
    "детска алергология Пловдив", "грижа за новородени Пловдив", "детски специалист Пловдив",
    "pediatrician Plovdiv", "pediatric specialist Bulgaria",
  ],
  openGraph: {
    title: "Детски лекар Пловдив — Д-р Златомира Манолова",
    description: "Частен педиатър в Пловдив. Детска алергология, спешна педиатрия, грижа за новородени. Запазете час онлайн.",
    siteName: "Педиатрия Манолова",
    images: [{ url: "/logo.jpg", width: 800, height: 600, alt: "Д-р Манолова — Педиатър Пловдив" }],
    locale: "bg_BG",
    type: "website",
    url: SITE_URL,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "bg": SITE_URL,
      "en": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  robots: { index: true, follow: true },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getSuperdocStats() {
  try {
    const stats = await prisma.superdocStat.findUnique({ where: { id: "singleton" } });
    return {
      ratingValue: stats?.rating?.replace("/5", "") ?? "5.0",
      reviewCount: stats?.reviewsCount ?? "14",
    };
  } catch {
    return { ratingValue: "5.0", reviewCount: "14" };
  }
}

function buildStructuredData(ratingValue: string, reviewCount: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["MedicalBusiness", "LocalBusiness"],
        "@id": `${SITE_URL}/#practice`,
        "name": "МЦ 'Д-р Златомира Манолова'",
        "alternateName": ["Manolova Pediatrics", "Педиатрия Манолова"],
        "url": SITE_URL,
        "logo": `${SITE_URL}/logo.jpg`,
        "image": `${SITE_URL}/logo.jpg`,
        "description": "Частна педиатрична практика в Пловдив. Специализирана помощ за деца от 0 до 18 години — обща педиатрия, детска алергология, грижа за новородени.",
        "telephone": "+35988555710",
        "email": "zlatomira.manolova@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "A11 - кв. Захари Зограф, Ж.К. Тракия 52Б",
          "addressLocality": "Пловдив",
          "addressRegion": "Пловдивска област",
          "postalCode": "4023",
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
        "medicalSpecialty": "Pediatrics",
        "priceRange": "$$",
        "currenciesAccepted": "BGN",
        "paymentAccepted": "Cash, Bank Transfer",
        "inLanguage": ["bg", "en"],
        "openingHoursSpecification": [
          { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "08:30", "closes": "16:30" },
          { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "10:00", "closes": "14:00" },
        ],
        "hasMap": "https://maps.google.com/maps?q=42.136959,24.790681",
        "sameAs": [
          "https://superdoc.bg/lekar/zlatomira-manolova",
          "https://www.mbal-pz.com",
        ],
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": ratingValue,
          "reviewCount": reviewCount,
          "bestRating": "5",
          "worstRating": "1",
        },
      },
      {
        "@type": "Physician",
        "@id": `${SITE_URL}/#doctor`,
        "name": "Д-р Златомира Манолова-Пенева",
        "givenName": "Златомира",
        "familyName": "Манолова",
        "honorificPrefix": "Д-р",
        "jobTitle": "Началник на Второ педиатрично отделение, МБАЛ Пазарджик",
        "description": "Специалист педиатрия, завършила МУ Пловдив (2018), специалност (2023). Началник отделение от 2025 г. Носител на отличие 'Ти си нашето бъдеще' от БЛС.",
        "medicalSpecialty": ["Pediatrics", "Allergy"],
        "worksFor": { "@id": `${SITE_URL}/#practice` },
        "url": `${SITE_URL}/about`,
        "alumniOf": {
          "@type": "EducationalOrganization",
          "name": "Медицински университет – Пловдив",
        },
        "award": "Ти си нашето бъдеще — Български лекарски съюз (2023)",
        "sameAs": ["https://superdoc.bg/lekar/zlatomira-manolova"],
      },
    ],
  };
}

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmergencyBanner from "@/components/EmergencyBanner";
import CookieConsent from "@/components/CookieConsent";
import { getSession } from "@/lib/auth";
import { Providers } from "@/components/Providers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, cookieStore, { ratingValue, reviewCount }] = await Promise.all([
    getSession(),
    cookies(),
    getSuperdocStats(),
  ]);
  const user = session?.user || null;
  const lang = cookieStore.get("language")?.value === "en" ? "en" : "bg";
  const structuredData = buildStructuredData(ratingValue, reviewCount);

  return (
    <html lang={lang} className={`${montserrat.variable} ${openSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}
