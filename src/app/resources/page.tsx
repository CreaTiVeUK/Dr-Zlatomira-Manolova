import Link from "next/image";
import LinkNext from "next/link";

const RESOURCES = [
    {
        title: "Педиатрията не се побира в учебници, тя се живее",
        category: "ИНТЕРВЮ • 2025",
        excerpt: "Дълбоко философско и практическо интервю за списание 'Педиатрия плюс' относно призванието и предизвикателствата в съвременната грижа за децата.",
        readTime: "10 мин четене",
        link: "https://pediatria-bg.eu/д-р-златомира-манолова-пенева-педиа/"
    },
    {
        title: "Хуманност и изкуство в педиатрията",
        category: "ИНИЦИАТИВА • 2024",
        excerpt: "Репортаж за проекта по преобразяване на детското отделение в Пазарджик с участието на местни ученици и общественици.",
        readTime: "6 мин четене",
        link: "https://darik.bg/osmoklasnici-preobraziha-steni-vav-vtoro-detsko-otdelenie-na-mbal-pazardzik"
    },
    {
        title: "Най-голямата мотивация са децата",
        category: "ВИЗИЯ • 2024",
        excerpt: "Д-р Манолова за амбициите си да обнови изцяло облика на педиатричната помощ и ролята на модерната диагностика.",
        readTime: "5 мин четене",
        link: "https://pa1-media.bg/%D0%B4-%D1%80-%D0%B7%D0%BB%D0%B0%D1%82%D0%BE%D0%BC%D0%B8%D1%80%D0%B0-%D0%BC%D0%B0%D0%BD%D0%BE%D0%BB%D0%BE%D0%B2%D0%B0-%D0%BD%D0%B0%D1%87%D0%B0%D0%BB%D0%BD%D0%B8%D0%BA-%D0%BD%D0%B0-%D0%B2%D1%82%D0%BE/"
    },
    {
        title: "Назначение за Началник на Второ отделение",
        category: "КАРИЕРА • 2023",
        excerpt: "Официално съобщение за поемането на ръководния пост в едно от най-натоварените педиатрични отделения в страната.",
        readTime: "3 мин четене",
        link: "https://www.mbal-pz.com/home/685-%D0%B4-%D1%80-%D0%B7-%D0%BC%D0%B0%D0%BD%D0%BE%D0%BB%D0%BE%D0%B2%D0%B0-%D0%B4%D0%B5%D1%86%D0%B0%D1%82%D0%B0-%D0%B8%D0%BC%D0%B0%D1%82-%D1%81%D0%BF%D0%B5%D1%86%D0%B8%D1%84%D0%B8%D1%87%D0%B5%D0%BD-%D0%B7%D0%B0%D1%80%D1%8F%D0%B4-%D0%BA%D0%BE%D0%B9%D1%82%D0%BE-%D0%BC%D0%B5-%D0%BC%D0%BE%D1%82%D0%B2%D0%B8%D1%80%D0%B0-%D0%B4%D0%B0-%D1%81%D1%8A%D0%BC-%D0%B4%D0%B5%D1%82%D1%81%D0%BA%D0%B8-%D0%BB%D0%B5%D0%BA%D0%B0%D1%80"
    },
    {
        title: "Номинация 'Ти си нашето бъдеще'",
        category: "ПРИЗНАНИЕ • 2023",
        excerpt: "Престижно отличие от Българския лекарски съюз за принос към бъдещето на медицината в България.",
        readTime: "4 мин четене",
        link: "https://www.mbal-pz.com/home/658-%D0%B4-%D1%80-%D0%B4%D0%B8%D0%BC%D0%B8%D1%82%D1%8A%D1%80-%D0%BC%D0%B8%D1%82%D1%80%D0%B5%D0%B2-%D0%B8-%D0%B4-%D1%80-%D0%B7%D0%BB%D0%B0%D1%82%D0%BE%D0%BC%D0%B8%D1%80%D0%B0-%D0%BC%D0%B0%D0%BD%D0%BE%D0%BB%D0%BE%D0%B2%D0%B0-%D0%B1%D1%8F%D1%85%D0%B0-%D0%BD%D0%B0%D0%B3%D1%80%D0%B0%D0%B4%D0%B5%D0%BD%D0%B8-%D0%BE%D1%82-%D1%80%D0%BA-%D0%BD%D0%B0-%D0%B1%D0%BB%D1%81"
    }
];

const FAQS = [
    { q: "Как да запазя час за спешен преглед?", a: "Свободните часове за спешни случаи се обявяват всеки ден в 08:30 ч. Моля, обадете се директно в нашата клиника." },
    { q: "Предлагате ли телемедицински консултации?", a: "Да, за последващи прегледи и общи съвети предлагаме сигурни видео консултации." },
    { q: "Клиниката работи ли с частни застраховки?", a: "Работим с повечето големи застрахователи в Обединеното кралство, включително Bupa, AXA и Vitality." }
];

export default function ResourcesPage() {
    return (
        <div className="section-padding">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '5rem' }}>
                    <h1 className="section-title">База знания</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)' }}>
                        Експертни медицински прозрения и практически съвети за родители, подготвени от д-р Манолова.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '5rem' }}>

                    {/* ARTICLES */}
                    <div>
                        <h2 style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--bg-soft)', paddingBottom: '0.5rem' }}>ПОСЛЕДНИ РЕСУРСИ</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            {RESOURCES.map((r, i) => (
                                <div key={i} style={{ borderBottom: '1px solid #eee', paddingBottom: '3rem' }}>
                                    <div style={{ color: 'var(--accent-bluish)', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>{r.category}</div>
                                    <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: 'var(--text-charcoal)' }}>{r.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>{r.excerpt}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <LinkNext href={r.link || "/resources/article"} target={r.link ? "_blank" : "_self"} style={{ color: 'var(--primary-teal)', fontWeight: '700' }}>ПРОЧЕТЕТЕ СТАТИЯТА →</LinkNext>
                                        <span style={{ fontSize: '0.85rem', color: '#ccc' }}>{r.readTime}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SIDEBAR FAQ */}
                    <div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)', marginBottom: '3rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>ЧЕСТО ЗАДАВАНИ ВЪПРОСИ</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {FAQS.map((f, i) => (
                                    <div key={i}>
                                        <div style={{ fontWeight: '700', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{f.q}</div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{f.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'var(--primary-teal)', color: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
                            <h3 style={{ color: 'white', marginBottom: '1rem' }}>Нуждаете се от съвет?</h3>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.9 }}>Изпратете директно запитване към нашия клиничен екип.</p>
                            <LinkNext href="/contact" className="btn" style={{ background: 'white', color: 'var(--primary-teal)', border: 'none', width: '100%' }}>СВЪРЖЕТЕ СЕ С НАС</LinkNext>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
