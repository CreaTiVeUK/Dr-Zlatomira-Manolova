import Link from "next/link";

export default function SuccessPage() {
    return (
        <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
            <div style={{ background: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '0 auto' }}>
                <h1 style={{ color: '#2ecc71', marginBottom: '1rem' }}>Часът е запазен успешно!</h1>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                    Благодарим ви за резервацията. Скоро ще получите потвърждение по имейл.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link href="/my-appointments" className="btn btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 1.5rem', borderRadius: '6px' }}>
                        Вижте часовете
                    </Link>
                    <Link href="/" style={{ textDecoration: 'none', color: 'var(--primary-teal)', padding: '0.8rem 1.5rem' }}>
                        Начало
                    </Link>
                </div>
            </div>
        </div>
    );
}
