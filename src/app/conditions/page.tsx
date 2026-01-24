export default function Conditions() {
    return (
        <div className="section-padding">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '4rem' }}>
                    <h1 className="section-title">Лекувани състояния</h1>
                    <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)' }}>
                        Д-р Злати предоставя експертна оценка и управление на широк спектър от педиатрични състояния - от обичайни детски болести до комплексни хронични заболявания.
                    </p>
                </div>

                <div className="card-grid">
                    <div className="premium-card">
                        <h3>Респираторни</h3>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                            <li>• Астма и хрипове</li>
                            <li>• Хронична кашлица</li>
                            <li>• Гръдни инфекции</li>
                        </ul>
                    </div>
                    <div className="premium-card">
                        <h3>Гастроинтестинални</h3>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                            <li>• Рефлукс и повръщане</li>
                            <li>• Коремна болка</li>
                            <li>• Запек</li>
                        </ul>
                    </div>
                    <div className="premium-card">
                        <h3>Алергични</h3>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                            <li>• Хранителни алергии</li>
                            <li>• Екзема</li>
                            <li>• Сенна хрема</li>
                        </ul>
                    </div>
                    <div className="premium-card">
                        <h3>Неонатални</h3>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                            <li>• Колики и подкрепа при хранене</li>
                            <li>• Мониторинг на жълтеница</li>
                            <li>• Растеж на новороденото</li>
                        </ul>
                    </div>
                    <div className="premium-card">
                        <h3>Общо здраве</h3>
                        <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)' }}>
                            <li>• Висока температура</li>
                            <li>• Проблеми с растежа</li>
                            <li>• Нощно напикаване</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
