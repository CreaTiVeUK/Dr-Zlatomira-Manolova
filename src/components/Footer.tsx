"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
    const { dict } = useLanguage();

    return (
        <footer style={{ background: 'var(--bg-footer)', color: 'white', padding: '6rem 0 3rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '5rem', marginBottom: '5rem' }}>
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1rem' }}>{dict.footer.title}</h4>
                        <p style={{ color: 'var(--text-footer-muted)', fontSize: '0.9rem', lineHeight: '1.8' }}>
                            {dict.footer.desc}
                        </p>
                    </div>
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem' }}>{dict.footer.links}</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-footer-muted)' }}>
                            <li><Link href="/">{dict.header.nav.home}</Link></li>
                            <li><Link href="/services">{dict.header.nav.services}</Link></li>
                            <li><Link href="/book">{dict.header.nav.book}</Link></li>
                            <li><Link href="/contact">{dict.header.nav.contact}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem' }}>{dict.footer.location}</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-footer-muted)' }}>
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
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem' }}>{dict.footer.hours}</h4>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-footer-muted)' }}>
                            {dict.footer.hoursDetails.weekdays}<br />
                            {dict.footer.hoursDetails.saturday}<br />
                            {dict.footer.hoursDetails.sunday}
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-footer-muted)' }}>
                    <p>&copy; {new Date().getFullYear()} {dict.footer.rights}</p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link href="/privacy">{dict.footer.privacy}</Link>
                        <Link href="/terms">{dict.footer.terms}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
