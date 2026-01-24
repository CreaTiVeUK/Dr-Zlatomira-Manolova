"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SuccessPage() {
    const { dict } = useLanguage();

    return (
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '0 auto' }}>
                <h1 style={{ color: '#2ecc71', marginBottom: '1rem' }}>{dict.successPage.title}</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                    {dict.successPage.message}
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link href="/my-appointments" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: '6px' }}>
                        {dict.successPage.viewAppointments}
                    </Link>
                    <Link href="/" style={{ textDecoration: 'none', color: 'var(--primary-teal)', padding: '0.8rem 1.5rem' }}>
                        {dict.successPage.home}
                    </Link>
                </div>
            </div>
        </div>
    );
}
