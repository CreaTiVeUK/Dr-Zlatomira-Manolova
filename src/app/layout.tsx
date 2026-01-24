import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  title: "Д-р Златомира Манолова | Педиатрия Манолова",
  description: "Експерт педиатър. Цялостни медицински грижи, изследвания за алергии и подкрепа за новородени.",
  keywords: ["педиатър", "детски специалист", "тестове за алергии", "д-р манолова", "неонатална грижа"],
  openGraph: {
    title: "Д-р Златомира Манолова | Педиатрия Манолова",
    description: "Експертна медицинска грижа за вашето дете.",
    siteName: "Педиатрия Манолова",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "bg_BG",
    type: "website",
  },
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const user = session?.user || null;

  return (
    <html lang="bg">
      <body className={outfit.className}>
        <Header user={user} />
        <main style={{ minHeight: '80vh' }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
