"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { usePathname } from "next/navigation";

export default function Footer() {
    const { dict } = useLanguage();
    const pathname = usePathname();

    if (pathname.startsWith('/admin')) return null;

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-card">
                        <h4>{dict.footer.title}</h4>
                        <p>
                            {dict.footer.desc}
                        </p>
                    </div>
                    <div className="footer-card">
                        <h4>{dict.footer.links}</h4>
                        <ul className="footer-list" style={{ listStyle: 'none' }}>
                            <li><Link href="/">{dict.header.nav.home}</Link></li>
                            <li><Link href="/services">{dict.header.nav.services}</Link></li>
                            <li><Link href="/book">{dict.header.nav.book}</Link></li>
                            <li><Link href="/contact">{dict.header.nav.contact}</Link></li>
                        </ul>
                    </div>
                    <div className="footer-card">
                        <h4>{dict.footer.location}</h4>
                        <ul className="footer-list" style={{ listStyle: 'none' }}>
                            <li>
                                <strong>{dict.footer.medicalCenter}</strong><br />
                                {dict.footer.addressMain}
                            </li>
                            <li>
                                <strong>{dict.footer.partnerHospital}</strong><br />
                                {dict.footer.addressSecond}
                            </li>
                        </ul>
                    </div>
                    <div className="footer-card">
                        <h4>{dict.footer.hours}</h4>
                        <div>
                            {dict.footer.hoursDetails.weekdays}<br />
                            {dict.footer.hoursDetails.saturday}<br />
                            {dict.footer.hoursDetails.sunday}
                        </div>
                    </div>
                </div>
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
