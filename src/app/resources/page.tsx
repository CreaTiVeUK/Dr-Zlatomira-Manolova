"use client";

import LinkNext from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ResourcesPage() {
    const { dict } = useLanguage();

    // Better approach: Define links in component, merge with text from dict.
    return (
        <div className="section-padding">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '5rem' }}>
                    <h1 className="section-title">{dict.resources.title}</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)' }}>
                        {dict.resources.subtitle}
                    </p>
                </div>

                <div className="resource-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '5rem' }}>

                    {/* ARTICLES */}
                    <div>
                        <h2 style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>{dict.resources.latest}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {dict.resources.articles.map((r, i) => (
                                <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '3rem' }}>
                                    <div style={{ color: 'var(--accent-bluish)', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>{r.category}</div>
                                    <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--text-charcoal)' }}>{r.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{r.excerpt}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <LinkNext href={r.link || "/resources/article"} target={r.link ? "_blank" : "_self"} style={{ color: 'var(--primary-teal)', fontWeight: '700' }}>{dict.resources.readArticle}</LinkNext>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>5 min read</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SIDEBAR FAQ */}
                    <div>
                        <div style={{ background: 'var(--bg-white)', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)', marginBottom: '3rem', border: '1px solid var(--border)' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--text-charcoal)' }}>{dict.resources.faq.title}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {dict.resources.faq.items.map((f, i) => (
                                    <div key={i}>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-charcoal)' }}>{f.q}</div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{f.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'var(--primary-teal)', color: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ color: 'white', marginBottom: '1rem' }}>{dict.resources.cta.title}</h3>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.9 }}>{dict.resources.cta.text}</p>
                            <LinkNext href="/contact" className="btn btn-primary" style={{ background: 'var(--bg-white)', color: 'var(--primary-teal)', border: 'none', width: '100%', transition: 'var(--transition-fast)' }}>{dict.resources.cta.btn}</LinkNext>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
