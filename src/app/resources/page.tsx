"use client";

import LinkNext from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ResourcesPage() {
    const { dict } = useLanguage();

    const RESOURCES = dict.resources.articles.map(article => ({
        ...article,
        link: "" // Links are not in dict, maybe I should have kept them in component or added to dict. 
        // For now I will assume links are external and maybe hardcoded or I need to merge them.
        // Actually, looking at previous file, links were specific external URLs. 
        // I should probably keep the links in the component but get the text from dict.
        // Or better, just map based on index if the count is same.
    }));

    // Better approach: Define links in component, merge with text from dict.
    const EX_LINKS = [
        "https://pediatria-bg.eu/д-р-златомира-манолова-пенева-педиа/",
        "https://darik.bg/osmoklasnici-preobraziha-steni-vav-vtoro-detsko-otdelenie-na-mbal-pazardzik",
        "https://pa1-media.bg/%D0%B4-%D1%80-%D0%B7%D0%BB%D0%B0%D1%82%D0%BE%D0%BC%D0%B8%D1%80%D0%B0-%D0%BC%D0%B0%D0%BD%D0%BE%D0%BB%D0%BE%D0%B2%D0%B0-%D0%BD%D0%B0%D1%87%D0%B0%D0%BB%D0%BD%D0%B8%D0%BA-%D0%BD%D0%B0-%D0%B2%D1%82%D0%BE/",
        "https://www.mbal-pz.com/home/685-%D0%B4-%D1%80-%D0%B7-%D0%BC%D0%B0%D0%BD%D0%BE%D0%BB%D0%BE%D0%B2%D0%B0-%D0%B4%D0%B5%D1%86%D0%B0%D1%82%D0%B0-%D0%B8%D0%BC%D0%B0%D1%82-%D1%81%D0%BF%D0%B5%D1%86%D0%B8%D1%84%D0%B8%D1%87%D0%B5%D0%BD-%D0%B7%D0%B0%D1%80%D1%8F%D0%B4-%D0%BA%D0%BE%D0%B9%D1%82%D0%BE-%D0%BC%D0%B5-%D0%BC%D0%BE%D1%82%D0%B2%D0%B8%D1%80%D0%B0-%D0%B4%D0%B0-%D1%81%D1%8A%D0%BC-%D0%B4%D0%B5%D1%82%D1%81%D0%BA%D0%B8-%D0%BB%D0%B5%D0%BA%D0%B0%D1%80",
        "https://www.mbal-pz.com/home/658-%D0%B4-%D1%80-%D0%B4%D0%B8%D0%BC%D0%B8%D1%82%D1%8A%D1%80-%D0%BC%D0%B8%D1%82%D1%80%D0%B5%D0%B2-%D0%B8-%D0%B4-%D1%80-%D0%B7%D0%BB%D0%B0%D1%82%D0%BE%D0%BC%D0%B8%D1%80%D0%B0-%D0%BC%D0%B0%D0%BD%D0%BE%D0%BB%D0%BE%D0%B2%D0%B0-%D0%B1%D1%8F%D1%85%D0%B0-%D0%BD%D0%B0%D0%B3%D1%80%D0%B0%D0%B4%D0%B5%D0%BD%D0%B8-%D0%BE%D1%82-%D1%80%D0%BA-%D0%BD%D0%B0-%D0%B1%D0%BB%D1%81"
    ];

    return (
        <div className="section-padding">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '5rem' }}>
                    <h1 className="section-title">{dict.resources.title}</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)' }}>
                        {dict.resources.subtitle}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '5rem' }}>

                    {/* ARTICLES */}
                    <div>
                        <h2 style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--bg-soft)', paddingBottom: '0.5rem' }}>{dict.resources.latest}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {dict.resources.articles.map((r, i) => (
                                <div key={i} style={{ borderBottom: '1px solid #eee', paddingBottom: '3rem' }}>
                                    <div style={{ color: 'var(--accent-bluish)', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>{r.category}</div>
                                    <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--text-charcoal)' }}>{r.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{r.excerpt}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <LinkNext href={EX_LINKS[i] || "/resources/article"} target={EX_LINKS[i] ? "_blank" : "_self"} style={{ color: 'var(--primary-teal)', fontWeight: '700' }}>{dict.resources.readArticle}</LinkNext>
                                        <span style={{ fontSize: '0.85rem', color: '#ccc' }}>5 min read</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SIDEBAR FAQ */}
                    <div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)', marginBottom: '3rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>{dict.resources.faq.title}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {dict.resources.faq.items.map((f, i) => (
                                    <div key={i}>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{f.q}</div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{f.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'var(--primary-teal)', color: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ color: 'white', marginBottom: '1rem' }}>{dict.resources.cta.title}</h3>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.9 }}>{dict.resources.cta.text}</p>
                            <LinkNext href="/contact" className="btn" style={{ background: 'white', color: 'var(--primary-teal)', border: 'none', width: '100%' }}>{dict.resources.cta.btn}</LinkNext>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
