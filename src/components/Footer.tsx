"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { usePathname } from "next/navigation";

const MAIN_PRACTICE_MAPS_URL = "https://www.google.com/maps/dir/?api=1&destination=42.136959,24.790681";

interface FooterProps {
    user: {
        id: string;
        email: string;
        name: string;
        role: string;
    } | null;
}

export default function Footer({ user }: FooterProps) {
    const { dict, language } = useLanguage();
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) return null;

    // Anonymous visitors cannot use /book (it redirects to login) — send them
    // straight there instead, with callbackUrl so they land on /book right
    // after signing in. Account holders get the booking tool directly.
    const bookHref = user ? "/book" : "/login?callbackUrl=%2Fbook";

    const partnerHospitalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dict.footer.partnerHospital}, ${dict.footer.addressSecond}`)}`;
    const newTabHint = language === "bg" ? "отваря се в нов раздел" : "opens in a new tab";

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-card">
                        <h4>{dict.footer.title}</h4>
                        <p>
                            {dict.footer.desc}
                        </p>
                        <div className="btn-group" style={{ marginTop: "1rem" }}>
                            <Link href={bookHref} className="btn btn-primary">
                                {dict.header.nav.book}
                            </Link>
                            <Link href="/contact" className="btn btn-outline">
                                {dict.header.nav.contact}
                            </Link>
                        </div>
                    </div>
                    <div className="footer-card">
                        <h4>{dict.footer.links}</h4>
                        <ul className="footer-list" style={{ listStyle: 'none' }}>
                            <li><Link href="/">{dict.header.nav.home}</Link></li>
                            <li><Link href="/services">{dict.header.nav.services}</Link></li>
                            <li><Link href={bookHref}>{dict.header.nav.book}</Link></li>
                            <li><Link href="/contact">{dict.header.nav.contact}</Link></li>
                        </ul>
                    </div>
                    <div className="footer-card">
                        <h4>{dict.footer.location}</h4>
                        <ul className="footer-list" style={{ listStyle: 'none' }}>
                            <li>
                                <a href={MAIN_PRACTICE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="footer-location-link">
                                    <strong>{dict.footer.medicalCenter}</strong><br />
                                    {dict.footer.addressMain}
                                    <ExternalLink size={13} aria-hidden="true" className="footer-location-link__icon" />
                                    <span className="sr-only"> ({newTabHint})</span>
                                </a>
                            </li>
                            <li>
                                <a href={partnerHospitalMapsUrl} target="_blank" rel="noopener noreferrer" className="footer-location-link">
                                    <strong>{dict.footer.partnerHospital}</strong><br />
                                    {dict.footer.addressSecond}
                                    <ExternalLink size={13} aria-hidden="true" className="footer-location-link__icon" />
                                    <span className="sr-only"> ({newTabHint})</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                    <Link href="/contact" className="footer-card footer-card--link">
                        <h4>{dict.footer.hours}</h4>
                        <div>
                            {dict.footer.hoursDetails.lines.map((line) => (
                                <span key={line}>{line}<br /></span>
                            ))}
                        </div>
                    </Link>
                </div>
                <p className="footer-emergency">
                    <a href="tel:112" className="emergency-link">{dict.emergency}</a>
                </p>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} {dict.footer.rights}</p>
                    <div className="footer-bottom__links">
                        <Link href="/privacy">{dict.footer.privacy}</Link>
                        <Link href="/terms">{dict.footer.terms}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
