"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { signIn } from "next-auth/react";

function SocialLoginButton({ provider, label, dict }: { provider: string, label: string, dict: any }) {
    const icons: any = {
        google: (
            <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
            </svg>
        ),
        facebook: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
        ),
        apple: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M17.057 1.293c.854-.984 1.428-2.35 1.272-3.71.055-.008.204-.012.356-.012 1.168 0 2.235.452 2.923 1.18.847.818 1.48 2.054 1.348 3.36-.023.238-.13.5-.23.75-.43.918-.945 1.734-1.504 2.503M18.877 8.35c.10.05 1.18 1.14 1.18 2.04 0 .046-.02.433-.04.475-.76 2.37-2.91 5.92-5.46 5.92-1.12 0-2.12-.59-3.23-.59-1.2 0-2.36.63-3.48.63-2.52 0-5.37-3.83-5.37-7.42 0-2.3.8-4.43 2.13-5.83 1.12-1.18 2.63-1.85 4.13-1.85 1.3 0 2.45.54 3.46.54 1.1 0 2.22-.54 3.66-.54 1.44 0 2.76.71 3.56 1.85z" />
            </svg>
        )
    };

    const brandColors: any = {
        google: { bg: '#fff', text: '#3c4043', border: '#dadce0' },
        facebook: { bg: '#0866FF', text: '#fff', border: '#0866FF' },
        apple: { bg: '#000', text: '#fff', border: '#000' }
    };

    const style = brandColors[provider];

    return (
        <button
            onClick={() => signIn(provider, { callbackUrl: "/book" })}
            style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: '4px',
                border: `1px solid ${style.border}`,
                background: style.bg,
                color: style.text,
                fontWeight: '500',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'var(--transition-fast)',
                boxShadow: provider === 'google' ? '0 1px 2px rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)' : 'none'
            }}
            className="social-btn"
        >
            <span style={{ display: 'flex', alignItems: 'center' }}>{icons[provider]}</span>
            <span>{dict.auth.login.continueWith} {label}</span>
        </button>
    );
}

export default function LoginPage() {
    const { dict } = useLanguage();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.role === 'ADMIN') {
                    router.push("/admin/dashboard");
                } else {
                    router.push("/book");
                }
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Login failed"); // Keeping generic fallback or add to dict
            }
        } catch (err) {
            setError("An error occurred");
        }
    };

    return (
        <div className="section-padding bg-soft" style={{ minHeight: '80vh' }}>
            <div className="container" style={{ maxWidth: '450px' }}>
                <div style={{ background: 'white', padding: '3rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                    <h2 style={{ textAlign: 'center', color: 'var(--primary-teal)', marginBottom: '2.5rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px' }}>{dict.auth.login.title}</h2>

                    {error && <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '4px', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>{dict.auth.login.email}</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>{dict.auth.login.password}</label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                placeholder="••••••••"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                            {dict.auth.login.btn}
                        </button>
                    </form>

                    <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{dict.auth.login.or}</span>
                        <div style={{ flex: 1, height: '1px', background: '#eee' }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <SocialLoginButton provider="google" label="Google" dict={dict} />
                        <SocialLoginButton provider="facebook" label="Facebook" dict={dict} />
                        <SocialLoginButton provider="apple" label="Apple ID" dict={dict} />
                    </div>

                    <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        {dict.auth.login.noAccount} <Link href="/register" style={{ color: 'var(--primary-teal)', fontWeight: '600' }}>{dict.auth.login.registerLink}</Link>
                    </div>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <p style={{ fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-charcoal)' }}>DEMO ACCESS / ДЕМО:</p>
                        <p>zlatomira.manolova@gmail.com / password123</p>
                        <p>patient@example.com / password123</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

