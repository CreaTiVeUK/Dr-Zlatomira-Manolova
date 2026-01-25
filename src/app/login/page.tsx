"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { signIn } from "next-auth/react";

function SocialLoginButton({ provider, label }: { provider: string, label: string }) {
    const brandColors: any = {
        google: { bg: '#fff', text: '#757575', border: '#ddd' },
        facebook: { bg: '#1877F2', text: '#fff', border: '#1877F2' },
        apple: { bg: '#000', text: '#fff', border: '#000' }
    };

    const style = brandColors[provider];

    return (
        <button
            onClick={() => signIn(provider)}
            style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${style.border}`,
                background: style.bg,
                color: style.text,
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
            {label}
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
                    router.push("/");
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
                        <SocialLoginButton provider="google" label="Google" />
                        <SocialLoginButton provider="facebook" label="Facebook" />
                        <SocialLoginButton provider="apple" label="Apple ID" />
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

