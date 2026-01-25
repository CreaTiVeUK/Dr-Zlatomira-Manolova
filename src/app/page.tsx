"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Home() {
  const { dict } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero-section">
        <Image
          src="/hero_premium.png"
          alt={dict.home.heroImageAlt}
          fill
          style={{ objectFit: 'cover', opacity: 0.55 }}
          priority
        />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="reveal hero-content">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                color: 'var(--accent-bluish)',
                fontWeight: '700',
                letterSpacing: '3px',
                fontSize: '0.85rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                MBBS, DCH, MRCPCH, FRCP
              </div>
            </div>

            <h1 className="hero-title">
              {dict.home.hero.title}<br />
              <span style={{ color: 'var(--primary-teal)' }}>{dict.home.hero.titleHighlight}</span>
            </h1>

            <p className="hero-subtitle">
              {dict.home.hero.subtitle}
            </p>

            <div className="btn-group">
              <Link href="/book" className="btn btn-primary" style={{ padding: '1.25rem 3.5rem', fontSize: '1rem' }}>{dict.home.hero.bookBtn}</Link>
              <Link href="/services" className="btn btn-outline" style={{ border: '2px solid white', color: 'white', padding: '1.25rem 3.5rem' }}>{dict.home.hero.servicesBtn}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & PARTNERS BAR */}
      <section className="trust-bar reveal">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3rem' }}>
          <a
            href={dict.home.trust.superdocLink}
            target="_blank"
            rel="noopener noreferrer"
            className="review-badge"
            style={{ textDecoration: 'none', transition: 'var(--transition-fast)' }}
            title={dict.home.trust.superdocTitle}
          >
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-teal)' }}>4.9/5</div>
            <div>
              <div style={{ display: 'flex', color: '#f4b400', fontSize: '1.1rem', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(s => <span key={s}>★</span>)}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{dict.home.trust.reviews}</div>
            </div>
          </a>

          <div style={{ height: '45px', width: '1px', background: '#e2e8f0' }} className="desktop-only"></div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {dict.home.trust.partners}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Image src="/partner_logos.png" alt={dict.home.partnerImageAlt} width={450} height={60} style={{ objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALIZED SERVICES GRID */}
      <section className="section-padding" style={{ background: '#fcfdfd' }}>
        <div className="container">
          <div className="text-center reveal">
            <h2 className="section-title">{dict.home.services.title}</h2>
            <p style={{ maxWidth: '700px', margin: '-1rem auto 4rem', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              {dict.home.services.subtitle}
            </p>
          </div>

          <div className="card-grid">
            <div className="premium-card reveal delay-1">
              <div style={{ position: 'relative', height: '240px', marginBottom: '2rem', borderRadius: '4px', overflow: 'hidden' }}>
                <Image
                  src="/service_general_paediatrics_1769272814052.png"
                  alt={dict.home.services.general.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3>{dict.home.services.general.title}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                {dict.home.services.general.desc}
              </p>
              <Link href="/services" style={{ color: 'var(--primary-teal)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '1px' }}>{dict.home.services.general.btn}</Link>
            </div>

            <div className="premium-card reveal delay-2">
              <div style={{ position: 'relative', height: '240px', marginBottom: '2rem', borderRadius: '4px', overflow: 'hidden' }}>
                <Image
                  src="/service_allergy_consultation_1769272828650.png"
                  alt={dict.home.services.allergy.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3>{dict.home.services.allergy.title}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                {dict.home.services.allergy.desc}
              </p>
              <Link href="/services" style={{ color: 'var(--primary-teal)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '1px' }}>{dict.home.services.allergy.btn}</Link>
            </div>

            <div className="premium-card reveal delay-3">
              <div style={{ position: 'relative', height: '240px', marginBottom: '2rem', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#f4f6f8', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>👶</div>
              </div>
              <h3>{dict.home.services.newborn.title}</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                {dict.home.services.newborn.desc}
              </p>
              <Link href="/services" style={{ color: 'var(--accent-bluish)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '1px' }}>{dict.home.services.newborn.btn}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION (REFINED) */}
      <section className="bg-soft section-padding reveal" id="about">
        <div className="container about-grid">
          <div className="about-image">
            <Image
              src="/dr_manolova.jpg"
              alt={dict.home.about.imageAlt}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div>
            <div className="clinical-badge" style={{ marginBottom: '1.5rem' }}>{dict.home.about.badge}</div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>{dict.home.about.name}</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', fontWeight: '600', color: 'var(--text-charcoal)' }}>
              {dict.home.about.role}
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
              {dict.home.about.bio1}
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
              {dict.home.about.bio2}
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
              {dict.home.about.bio3}
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
              {dict.home.about.bio4}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', borderTop: '1px solid #ddd', paddingTop: '2.5rem' }}>
              <div>
                <h4 style={{ color: 'var(--primary-teal)', marginBottom: '1rem', fontSize: '0.9rem', letterSpacing: '1px' }}>{dict.home.about.qualifications}</h4>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dict.home.about.qualList.map((q, i) => (
                    <li key={i}><strong>{q.split(' ')[0]} {q.split(' ')[1]}</strong> {q.split(' ').slice(2).join(' ')}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--primary-teal)', marginBottom: '1rem', fontSize: '0.9rem', letterSpacing: '1px' }}>{dict.home.about.specialties}</h4>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dict.home.about.specList.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Link href="/contact" className="btn btn-primary" style={{ marginTop: '3rem' }}>{dict.home.about.bioBtn}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

