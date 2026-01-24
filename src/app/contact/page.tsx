"use client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ContactPage() {
    const { dict } = useLanguage();

    return (
        <div className="section-padding">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '4rem' }}>
                    <h1 className="section-title">{dict.contact.title}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{dict.contact.subtitle}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '5rem' }}>

                    {/* CLINIC INFO */}
                    <div>
                        <h3 style={{ marginBottom: '2rem', color: 'var(--primary-teal)' }}>{dict.contact.clinics}</h3>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>{dict.contact.medicalCenter}</h4>
                            <p style={{ color: 'var(--text-muted)' }}>
                                123 Healthcare Way, London, W1G 9HP<br />
                                <strong>{dict.contact.tel}:</strong> +359 88 5557110<br />
                                <strong>{dict.contact.email}:</strong> zlatomira.manolova@gmail.com
                            </p>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>{dict.contact.partnerHospital}</h4>
                            <p style={{ color: 'var(--text-muted)' }}>
                                55 Specialist Lane, London, E4 8RR<br />
                                <strong>{dict.contact.tel}:</strong> +359 88 5557110
                            </p>
                        </div>

                        <div style={{ background: 'var(--bg-soft)', padding: '2rem', borderRadius: '4px' }}>
                            <h4 style={{ marginBottom: '1rem' }}>{dict.contact.admin.title}</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {dict.contact.admin.text}
                            </p>
                        </div>
                    </div>

                    {/* CONTACT FORM (UI ONLY) */}
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                        <h3 style={{ marginBottom: '2rem' }}>{dict.contact.form.title}</h3>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>{dict.contact.form.name}</label>
                                <input type="text" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>{dict.contact.form.email}</label>
                                <input type="email" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>{dict.contact.form.msg}</label>
                                <textarea style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', height: '120px' }} placeholder=""></textarea>
                            </div>
                            <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }}>{dict.contact.form.btn}</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

