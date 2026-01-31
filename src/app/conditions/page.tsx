"use client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Conditions() {
    const { dict } = useLanguage();

    return (
        <div className="section-padding">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '4rem' }}>
                    <h1 className="section-title">{dict.conditions.title}</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)' }}>
                        {dict.conditions.subtitle}
                    </p>
                </div>

                <div className="card-grid">
                    <div className="premium-card">
                        <h3>{dict.conditions.respiratory.title}</h3>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                            {dict.conditions.respiratory.list.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="premium-card">
                        <h3>{dict.conditions.gastro.title}</h3>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                            {dict.conditions.gastro.list.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="premium-card">
                        <h3>{dict.conditions.allergy.title}</h3>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                            {dict.conditions.allergy.list.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="premium-card">
                        <h3>{dict.conditions.neonatal.title}</h3>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                            {dict.conditions.neonatal.list.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                    <div className="premium-card">
                        <h3>{dict.conditions.general.title}</h3>
                        <ul className="list-checked" style={{ color: 'var(--text-muted)' }}>
                            {dict.conditions.general.list.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
