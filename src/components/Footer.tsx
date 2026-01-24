import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer style={{ background: 'var(--text-charcoal)', color: 'white', padding: '5rem 0 2rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
                    <div>
                        <h4 style={{ color: 'var(--primary-teal)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Педиатрия Злати</h4>
                        <p style={{ color: '#bbb', fontSize: '0.95rem' }}>
                            Предоставяне на експертна и състрадателна педиатрична помощ за деца от всички възрасти. Базирана в сърцето на Лондон.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem' }}>БЪРЗИ ВРЪЗКИ</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#bbb' }}>
                            <li><Link href="/">Начало</Link></li>
                            <li><Link href="/services">Услуги</Link></li>
                            <li><Link href="/book">Онлайн записване</Link></li>
                            <li><Link href="/contact">Свържете се с нас</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem' }}>МЕСТОПОЛОЖЕНИЕ</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: '#bbb' }}>
                            <li>
                                <strong>Медицински център</strong><br />
                                123 Healthcare Way, Лондон<br />
                                W1G 9HP
                            </li>
                            <li>
                                <strong>Партньорска болница</strong><br />
                                55 specialist Lane, Лондон<br />
                                E4 8RR
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem' }}>РАБОТНО ВРЕМЕ</h4>
                        <div style={{ fontSize: '0.9rem', color: '#bbb' }}>
                            Пн - Пт: 09:00 - 18:00<br />
                            Сб: 10:00 - 14:00<br />
                            Нд: Само спешни случаи
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid #444', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#888' }}>
                    <p>&copy; {new Date().getFullYear()} Д-р Златомира Манолова. Всички права запазени.</p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link href="/privacy">Политика за поверителност</Link>
                        <Link href="/terms">Условия за ползване</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
