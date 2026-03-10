import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  title: "Dr. Zlatomira Manolova | Manolova Pediatrics",
  description: "Expert Pediatrician. Comprehensive medical care, allergy testing and newborn support.",
  keywords: ["pediatrician", "child specialist", "allergy testing", "dr manolova", "newborn care"],
  openGraph: {
    title: "Dr. Zlatomira Manolova | Manolova Pediatrics",
    description: "Expert medical care for your child.",
    siteName: "Manolova Pediatrics",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_GB",
    type: "website",
  },
};

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
  const session = await getSession();
  const user = session?.user || null;

  return (
    <html lang="en">
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
