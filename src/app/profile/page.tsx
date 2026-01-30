
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { status } = useSession();
    const { dict } = useLanguage();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/profile");
            return;
        }

        if (status === "authenticated") {
            fetch("/api/user/profile")
                .then(res => res.json())
                .then(data => {
                    if (data.error) throw new Error(data.error);
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        phone: data.phone || ""
                    });
                })
                .catch(err => {
                    console.error(err);
                    setMessage({ text: dict.booking.error || "Error loading profile", type: "error" });
                })
                .finally(() => setIsLoading(false));
        }
    }, [status, router, dict.booking.error]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    phone: formData.phone
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to update");

            setMessage({ text: dict.myAppointments.cancelSuccess?.replace('cancelled', 'updated') || "Profile updated successfully!", type: "success" });

            // Update session if needed, though usually requires session reload
            // await update({ name: formData.name }); 

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
            setMessage({ text: errorMessage, type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (status === "loading" || isLoading) {
        return (
            <div className="section-padding bg-soft" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--primary-teal)', fontWeight: 'bold' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div className="section-padding bg-soft" style={{ minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '600px' }}>
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 className="section-title">My Profile</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your personal information</p>
                </div>

                <div className="booking-card"> {/* Reusing the style from BookClient */}
                    {message && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '4px',
                            marginBottom: '1.5rem',
                            background: message.type === 'success' ? '#e8f5e9' : '#ffebee',
                            color: message.type === 'success' ? '#2e7d32' : '#c62828'
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-charcoal)' }}>
                                {dict.auth.register.email}
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '0.9rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    background: '#f5f5f5',
                                    color: '#888',
                                    cursor: 'not-allowed'
                                }}
                            />
                            <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>Email cannot be changed</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-charcoal)' }}>
                                {dict.auth.register.name}
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.9rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-charcoal)' }}>
                                {dict.auth.register.phone}
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+359..."
                                style={{
                                    width: '100%',
                                    padding: '0.9rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
