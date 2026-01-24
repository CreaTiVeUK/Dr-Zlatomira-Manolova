"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {

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
      <section style={{
        position: 'relative',
        height: '80vh',
        minHeight: '700px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#001a1e' // Dark clinical base
      }}>
        <Image
          src="/hero_premium.png"
          alt="Клинична консултация с д-р Злати"
          fill
          style={{ objectFit: 'cover', opacity: 0.55 }}
          priority
        />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="reveal" style={{ maxWidth: '800px' }}>
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
              <div style={{ width: '40px', height: '1px', background: 'var(--accent-bluish)', opacity: 0.8 }}></div>
            </div>

            <h1 className="hero-title" style={{ color: 'white', fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '2rem', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
              Елитна медицинска помощ<br />
              <span style={{ color: 'var(--primary-teal)' }}>Посветена на децата.</span>
            </h1>

            <p style={{ fontSize: '1.4rem', color: 'white', marginBottom: '3.5rem', maxWidth: '650px', fontWeight: '500', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
              Осигуряване на най-високия стандарт на педиатричен опит в сърцето на Пловдив, съчетаващ клинични постижения с дълбока състрадателна грижа.
            </p>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link href="/book" className="btn btn-primary" style={{ padding: '1.25rem 3.5rem', fontSize: '1rem' }}>Запазете консултация</Link>
              <Link href="/services" className="btn btn-outline" style={{ border: '2px solid white', color: 'white', padding: '1.25rem 3.5rem' }}>Вижте услугите</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST & PARTNERS BAR */}
      <section className="trust-bar reveal">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="review-badge">
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary-teal)' }}>4.9/5</div>
            <div>
              <div style={{ display: 'flex', color: 'var(--accent-bluish)', fontSize: '1rem', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map(s => <span key={s}>★</span>)}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>280+ ПРОВЕРЕНИ ОТЗИВА</div>
            </div>
          </div>

          <div style={{ flex: 1, paddingLeft: '3rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '1rem', letterSpacing: '2px' }}>ПАРТНЬОРСТВО С ВОДЕЩИ КЛИНИКИ</div>
            <div className="partner-logo-grid">
              <Image src="/partner_logos.png" alt="Лога на партньорски болници" width={450} height={60} style={{ objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </section>

      {/* SPECIALIZED SERVICES GRID */}
      <section className="section-padding" style={{ background: '#fcfdfd' }}>
        <div className="container">
          <div className="text-center reveal">
            <h2 className="section-title">Клиничен опит</h2>
            <p style={{ maxWidth: '700px', margin: '-1rem auto 4rem', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
              От рутинни прегледи до специализирани диагностични клиники, ние предоставяме пълен спектър от педиатрични грижи.
            </p>
          </div>

          <div className="card-grid">
            <div className="premium-card reveal delay-1">
              <div style={{ position: 'relative', height: '240px', marginBottom: '2rem', borderRadius: '4px', overflow: 'hidden' }}>
                <Image
                  src="/service_general_paediatrics_1769272814052.png"
                  alt="Обща педиатрия"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3>Обща педиатрия</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                Експертно управление на остри детски заболявания, рутинни здравни прегледи и клинични ваксинации.
              </p>
              <Link href="/services" style={{ color: 'var(--primary-teal)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '1px' }}>ВИЖТЕ УСЛУГАТА →</Link>
            </div>

            <div className="premium-card reveal delay-2">
              <div style={{ position: 'relative', height: '240px', marginBottom: '2rem', borderRadius: '4px', overflow: 'hidden' }}>
                <Image
                  src="/service_allergy_consultation_1769272828650.png"
                  alt="Алергологични услуги"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <h3>Алергия и астма</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                Специализирано диагностично тестване и дългосрочни планове за лечение на комплексни детски алергии.
              </p>
              <Link href="/services" style={{ color: 'var(--primary-teal)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '1px' }}>ВИЖТЕ УСЛУГАТА →</Link>
            </div>

            <div className="premium-card reveal delay-3" style={{ borderTop: '4px solid var(--accent-bluish)' }}>
              <div style={{ position: 'relative', height: '240px', marginBottom: '2rem', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#f4f6f8', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>👶</div>
              </div>
              <h3>Грижа за новородени</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.7' }}>
                Специализирана подкрепа за здравето на новородените, проблеми с храненето и ранен преглед на развитието.
              </p>
              <Link href="/services" style={{ color: 'var(--accent-bluish)', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '1px' }}>ВИЖТЕ УСЛУГАТА →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION (REFINED) */}
      <section className="bg-soft section-padding reveal">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 450px) 1fr', gap: '6rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', height: '600px', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
            <Image
              src="/logo.jpg"
              alt="Д-р Злати Специалист"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div>
            <div className="clinical-badge" style={{ marginBottom: '1.5rem' }}>УТВЪРДЕН ПЕДИАТЪР</div>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '2.5rem' }}>Д-р Златомира Манолова-Пенева</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', fontWeight: '600', color: 'var(--text-charcoal)' }}>
              Началник на Второ педиатрично отделение
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
              Д-р Златомира Манолова-Пенева завършва Медицински университет – Пловдив през 2018 г., а през 2023 г. придобива специалност по педиатрия. Още в началото на професионалния си път тя насочва интересите си към детското здравеопазване, като се стреми към задълбочено практическо и теоретично обучение.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
              Специализацията си започва във Второ педиатрично отделение с интензивен сектор към МБАЛ – Пазарджик, където натрупва ценен клиничен опит. В рамките на обучението си преминава и през Клиниката по педиатрия на УМБАЛ „Св. Георги“ – Пловдив, което допринася за разширяване на професионалната ѝ подготовка и клиничен поглед.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
              След успешно завършване на специализацията д-р Манолова-Пенева продължава професионалното си развитие като лекар-специалист в МБАЛ – Пазарджик, като паралелно с това става част от екипа на Денонощна детска поликлиника „Пловдимед“ в Пловдив. Работата ѝ е насочена към осигуряване на качествена и навременна медицинска грижа за деца от различни възрастови групи.
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.8' }}>
              През 2025 г. тя заема ръководна позиция като началник на отделение – първоначално като временно изпълняващ длъжността, а впоследствие, след успешно проведен конкурс, и като титулярен началник. Професионализмът, отговорността и отдадеността ѝ към пациентите и екипа са високо оценени, като през 2023 г. е номинирана от Българския лекарски съюз в категорията „Ти си нашето бъдеще“.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', borderTop: '1px solid #ddd', paddingTop: '2.5rem' }}>
              <div>
                <h4 style={{ color: 'var(--primary-teal)', marginBottom: '1rem', fontSize: '0.9rem', letterSpacing: '1px' }}>КВАЛИФИКАЦИИ</h4>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li><strong>• MBBS</strong> Медицинска степен</li>
                  <li><strong>• DCH</strong> Диплома по детско здраве</li>
                  <li><strong>• MRCPCH</strong> Член на RCPCH</li>
                  <li><strong>• FRCPCH</strong> Член на RCPCH</li>
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--primary-teal)', marginBottom: '1rem', fontSize: '0.9rem', letterSpacing: '1px' }}>СПЕЦИАЛНОСТИ</h4>
                <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <li>• Педиатрична алергология</li>
                  <li>• Ранно детско развитие</li>
                  <li>• Спешни състояния</li>
                  <li>• Неонатологични консултации</li>
                </ul>
              </div>
            </div>

            <Link href="/contact" className="btn btn-primary" style={{ marginTop: '3rem' }}>Поискайте пълна биография</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

