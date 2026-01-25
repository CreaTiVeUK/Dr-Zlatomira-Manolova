"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function ReviewCarousel({ testimonials }: { testimonials: any[] }) {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const step = isMobile ? 1 : 2;
    const timer = setInterval(() => {
      setIndex((current) => (current + step >= testimonials.length ? 0 : current + step));
    }, 4500);
    return () => clearInterval(timer);
  }, [testimonials.length, isMobile]);

  const visibleReviews = isMobile
    ? [testimonials[index]]
    : [testimonials[index], testimonials[(index + 1) % testimonials.length]];

  return (
    <div style={{
      display: 'flex',
      gap: isMobile ? '1rem' : '2rem',
      flex: 1,
      overflow: 'hidden',
      minHeight: isMobile ? '120px' : '80px',
      alignItems: 'center',
      padding: isMobile ? '0 1rem' : '0'
    }}>
      {visibleReviews.map((rev, i) => (
        <div key={`rev-${index}-${i}`} className="reveal active" style={{ flex: 1, animation: 'fadeInScale 0.8s ease-out' }}>
          <p style={{
            fontStyle: 'italic',
            fontSize: isMobile ? '0.9rem' : '0.85rem',
            color: 'var(--text-charcoal)',
            marginBottom: '0.4rem',
            lineHeight: '1.5'
          }}>
            "{rev.text}"
          </p>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary-teal)', opacity: 0.8 }}>
            — {rev.author}
          </div>
        </div>
      ))}
      <style jsx>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const { dict, language } = useLanguage();
  const [trustStats, setTrustStats] = useState<{ rating: string, reviewsCount: string, testimonials: any[] } | null>(null);

  useEffect(() => {
    fetch('/api/trust-stats')
      .then(res => res.json())
      .then(data => {
        if (data.testimonials && Array.isArray(data.testimonials)) {
          // Map data to localized testimonials
          const testimonials = data.testimonials.map((t: any) => ({
            text: language === 'en' ? t.textEn : t.textBg,
            author: language === 'en' ? t.authorEn : t.authorBg
          }));
          setTrustStats({ ...data, testimonials });
        }
      })
      .catch(err => console.error("Stats fetch error:", err));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [language]);

  const stats = trustStats || {
    rating: dict.home.trust.rating,
    reviewsCount: dict.home.trust.reviewsCount,
    testimonials: dict.home.trust.testimonials
  };

  return (
    <div style={{ overflowX: 'hidden' }}>
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
        <div className="container trust-container-responsive" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <a
            href={dict.home.trust.superdocLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', transition: 'var(--transition-fast)', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}
            title={dict.home.trust.superdocTitle}
          >
            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary-teal)' }}>{stats.rating}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ display: 'flex', color: '#f4b400', fontSize: '1.1rem', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(s => <span key={s}>★</span>)}
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {stats.reviewsCount} {dict.home.trust.reviewsLabel}
              </div>
            </div>
          </a>

          <div style={{ height: '50px', width: '1px', background: '#e2e8f0' }} className="desktop-only"></div>

          <ReviewCarousel testimonials={stats.testimonials} />

          <div style={{ height: '50px', width: '1px', background: '#e2e8f0' }} className="desktop-only"></div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              {dict.home.trust.partners}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <a href="https://www.mbal-pz.com" target="_blank" rel="noopener noreferrer" style={{ transition: 'var(--transition-fast)', padding: '0.5rem' }} className="partner-logo">
                <Image src="/mbal_logo.png" alt="MBAL Pazardzhik" width={130} height={55} style={{ objectFit: 'contain' }} />
              </a>
              <a href="https://plovdimed.com" target="_blank" rel="noopener noreferrer" style={{ transition: 'var(--transition-fast)', padding: '0.5rem' }} className="partner-logo">
                <Image src="/plovdimed_logo.png" alt="Plovdimed" width={130} height={55} style={{ objectFit: 'contain' }} />
              </a>
            </div>
          </div>
        </div>
        <style jsx>{`
          .trust-container-responsive {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 3rem;
          }
          @media (max-width: 960px) {
            .trust-container-responsive {
              flex-direction: column;
              gap: 2.5rem;
              text-align: center;
            }
          }
        `}</style>
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

            <div className="qual-grid">
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

