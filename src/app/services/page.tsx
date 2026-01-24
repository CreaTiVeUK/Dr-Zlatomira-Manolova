import Link from "next/link";
import Image from "next/image";

export default function ServicesPage() {
    return (
        <div className="section-padding">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '5rem' }}>
                    <h1 className="section-title">Нашите педиатрични услуги</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        Предоставяме пълен спектър от педиатрични грижи - от рутинни профилактични прегледи до специализирани диагностични клиники.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>

                    {/* SERVICE 1 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative', height: '400px', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
                            <Image
                                src="/service_general_paediatrics_1769272814052.png"
                                alt="Обща педиатрия"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                        <div>
                            <h2 style={{ color: 'var(--primary-teal)', marginBottom: '1.5rem' }}>Обща педиатрия</h2>
                            <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                Осигуряваме цялостни здравни прегледи за деца от всички възрасти, гарантирайки, че тяхното израстване и развитие са в норма.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--text-muted)' }}>
                                <li style={{ marginBottom: '0.5rem' }}>• Цялостни здравни оценки</li>
                                <li style={{ marginBottom: '0.5rem' }}>• Рутинни ваксинации и имунизации</li>
                                <li style={{ marginBottom: '0.5rem' }}>• Лечение на остри детски заболявания</li>
                                <li style={{ marginBottom: '0.5rem' }}>• Консултации за растеж и хранене</li>
                            </ul>
                            <Link href="/book" className="btn btn-outline">Запазете този час</Link>
                        </div>
                    </div>

                    <div style={{ height: '1px', background: '#eee' }}></div>

                    {/* SERVICE 2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        <div style={{ order: 2 }}>
                            <h2 style={{ color: 'var(--primary-teal)', marginBottom: '1.5rem' }}>Детска алергология</h2>
                            <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                                Специализирани диагностични тестове и дългосрочни планове за лечение на деца, страдащи от комплексни алергии.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', color: 'var(--text-muted)' }}>
                                <li style={{ marginBottom: '0.5rem' }}>• Кожно-алергични тестове (резултати в същия ден)</li>
                                <li style={{ marginBottom: '0.5rem' }}>• Управление на хранителни алергии</li>
                                <li style={{ marginBottom: '0.5rem' }}>• Лечение на екзема и кожни състояния</li>
                                <li style={{ marginBottom: '0.5rem' }}>• Грижа при астма и сенна хрема</li>
                            </ul>
                            <Link href="/book" className="btn btn-outline">Запазете този час</Link>
                        </div>
                        <div style={{ position: 'relative', height: '400px', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', order: 1 }}>
                            <Image
                                src="/service_allergy_consultation_1769272828650.png"
                                alt="Алергологични услуги"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
