"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ServicesPage() {
    const { dict } = useLanguage();

    return (
        <div className="section-padding">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '5rem' }}>
                    <h1 className="section-title">{dict.servicesPage.title}</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        {dict.servicesPage.subtitle}
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

                    {/* SERVICE 1 */}
                    <div className="service-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', height: '400px', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                            <Image
                                src="/service_general_paediatrics_1769272814052.png"
                                alt={dict.servicesPage.general.title}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <h2 style={{ color: 'var(--primary-teal)', marginBottom: '1.5rem' }}>{dict.servicesPage.general.title}</h2>
                            <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                {dict.servicesPage.general.desc}
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--text-muted)' }}>
                                {dict.servicesPage.general.list.map((item, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
                                ))}
                            </ul>
                            <Link href="/book" className="btn btn-outline">{dict.servicesPage.general.btn}</Link>
                        </div>
                    </div>

                    <div style={{ height: '1px', background: '#eee' }}></div>

                    {/* SERVICE 2 */}
                    <div className="service-row service-row-reverse" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        <div className="order-1-mobile">
                            <h2 style={{ color: 'var(--primary-teal)', marginBottom: '1.5rem' }}>{dict.servicesPage.allergy.title}</h2>
                            <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                {dict.servicesPage.allergy.desc}
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--text-muted)' }}>
                                {dict.servicesPage.allergy.list.map((item, i) => (
                                    <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
                                ))}
                            </ul>
                            <Link href="/book" className="btn btn-outline">{dict.servicesPage.allergy.btn}</Link>
                        </div>
                        <div className="order-2-mobile" style={{ position: 'relative', height: '400px', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                            <Image
                                src="/service_allergy_consultation_1769272828650.png"
                                alt={dict.servicesPage.allergy.title}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
