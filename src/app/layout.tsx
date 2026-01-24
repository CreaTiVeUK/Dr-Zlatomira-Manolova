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
  title: "Д-р Златомира Манолова | Педиатрия Злати Лондон",
  description: "Експерт педиатър в Лондон. Цялостни медицински грижи, изследвания за алергии и подкрепа за новородени за деца от всички възрасти.",
  keywords: ["педиатър лондон", "детски специалист", "тестове за алергии", "д-р злати", "неонатална грижа"],
  openGraph: {
    title: "Д-р Златомира Манолова | Педиатрия Злати",
    description: "Експертна медицинска грижа за вашето дете в сърцето на Лондон.",
    url: "https://zlatipediatrics.com",
    siteName: "Педиатрия Злати",
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
