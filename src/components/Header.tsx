import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/UserMenu";

export default function Header({ user }: { user: any }) {
    return (
        <>
            {/* Utility Bar */}
            <div style={{ background: 'var(--bg-soft)', padding: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                        <span>📞 +359 88 5557110</span>
                        <span>✉️ zlatomira.manolova@gmail.com</span>
                        <div className="clinical-badge">
                            Възраст 0-18 години
                        </div>
                    </div>
                    <div style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Специализирана педиатрична помощ в Пловдив
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header style={{ padding: '1.5rem 0', background: 'white', borderBottom: '1px solid #eee' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <Image
                            src="/logo.jpg"
                            alt="Лого"
                            width={55}
                            height={55}
                            style={{ borderRadius: '50%' }}
                        />
                        <div>
                            <div style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: 'var(--primary-teal)',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                lineHeight: '1'
                            }}>
                                Д-р Златомира Манолова
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                                ПЕДИАТЪР СПЕЦИАЛИСТ
                            </div>
                        </div>
                    </Link>

                    <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontFamily: 'var(--font-heading)', fontWeight: '600', fontSize: '0.9rem' }}>
                        <Link href="/" style={{ color: 'var(--text-charcoal)' }}>НАЧАЛО</Link>
                        <Link href="/services" style={{ color: 'var(--text-charcoal)' }}>УСЛУГИ</Link>
                        <Link href="/conditions" style={{ color: 'var(--text-charcoal)' }}>ЗАБОЛЯВАНИЯ</Link>
                        <Link href="/resources" style={{ color: 'var(--text-charcoal)' }}>РЕСУРСИ</Link>
                        <Link href="/book" style={{ color: 'var(--text-charcoal)', whiteSpace: 'nowrap' }}>ЗАПАЗЕТЕ ЧАС</Link>
                        <Link href="/contact" style={{ color: 'var(--text-charcoal)' }}>КОНТАКТИ</Link>
                        <div style={{ width: '1px', height: '20px', background: '#ddd', margin: '0 0.5rem' }}></div>
                        <UserMenu user={user} />
                    </nav>
                </div>
            </header>
        </>
    );
}
