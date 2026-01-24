export default function ContactPage() {
    return (
        <div className="section-padding">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '4rem' }}>
                    <h1 className="section-title">Запишете час</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Свържете се с д-р Манолова за експертна педиатрична грижа и клинична диагностика.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '5rem' }}>

                    {/* CLINIC INFO */}
                    <div>
                        <h3 style={{ marginBottom: '2rem', color: 'var(--primary-teal)' }}>Нашите клиники</h3>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>Медицински център</h4>
                            <p style={{ color: 'var(--text-muted)' }}>
                                123 Healthcare Way, Лондон, W1G 9HP<br />
                                <strong>Тел:</strong> +359 88 5557110<br />
                                <strong>Имейл:</strong> zlatomira.manolova@gmail.com
                            </p>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>Партньорска болница</h4>
                            <p style={{ color: 'var(--text-muted)' }}>
                                55 Specialist Lane, Лондон, E4 8RR<br />
                                <strong>Тел:</strong> +359 88 5557110
                            </p>
                        </div>

                        <div style={{ background: 'var(--bg-soft)', padding: '2rem', borderRadius: '4px' }}>
                            <h4 style={{ marginBottom: '1rem' }}>Администрация и плащания</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                За административни въпроси или такива, свързани с плащания, моля свържете се с централния ни офис между 09:00 - 17:00 ч.
                            </p>
                        </div>
                    </div>

                    {/* CONTACT FORM (UI ONLY) */}
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                        <h3 style={{ marginBottom: '2rem' }}>Форма за запитване</h3>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>ПЪЛНО ИМЕ</label>
                                <input type="text" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="Вашето име" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>ИМЕЙЛ АДРЕС</label>
                                <input type="email" style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }} placeholder="email@example.com" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>СЪОБЩЕНИЕ</label>
                                <textarea style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', height: '120px' }} placeholder="С какво можем да помогнем?"></textarea>
                            </div>
                            <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }}>ИЗПРАТЕТЕ ЗАПИТВАНЕ</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

