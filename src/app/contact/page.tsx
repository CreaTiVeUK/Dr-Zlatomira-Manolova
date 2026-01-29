"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ContactPage() {
    const { dict } = useLanguage();

    // State for form handling
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus("idle");
        setErrorMsg("");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", message: "" });
            } else {
                setStatus("error");
                setErrorMsg(data.error || "Failed to send message");
            }
        } catch {
            setStatus("error");
            setErrorMsg("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section-padding">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '4rem' }}>
                    <h1 className="section-title">{dict.contact.title}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{dict.contact.subtitle}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '5rem' }}>

                    {/* CLINIC INFO */}
                    <div>
                        <h3 style={{ marginBottom: '2rem', color: 'var(--primary-teal)' }}>{dict.contact.clinics}</h3>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>{dict.contact.medicalCenter}</h4>
                            <p style={{ color: 'var(--text-muted)' }}>
                                {dict.contact.addressMain}<br />
                                <strong>{dict.contact.tel}:</strong> {dict.footer.phone}<br />
                                <strong>{dict.contact.email}:</strong> zlatomira.manolova@gmail.com
                            </p>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>{dict.contact.partnerHospital}</h4>
                            <p style={{ color: 'var(--text-muted)' }}>
                                {dict.contact.addressSecond}<br />
                                <strong>{dict.contact.tel}:</strong> {dict.footer.phone}
                            </p>
                        </div>

                        <div style={{ background: 'var(--bg-soft)', padding: '2rem', borderRadius: '4px', marginBottom: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem' }}>{dict.contact.admin.title}</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                {dict.contact.admin.text}
                            </p>
                        </div>

                        {/* GOOGLE MAP */}
                        <div style={{ borderRadius: '8px', overflow: 'hidden', height: '300px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                            <iframe
                                src="https://maps.google.com/maps?q=Zh.K.+Trakia+52+Plovdiv&z=16&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>

                    {/* CONTACT FORM */}
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                        <h3 style={{ marginBottom: '2rem' }}>{dict.contact.form.title}</h3>

                        {status === "success" ? (
                            <div style={{ padding: '1.5rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                                <strong>Message Sent!</strong>
                                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Thank you for reaching out. We will get back to you shortly.</p>
                                <button onClick={() => setStatus("idle")} style={{ marginTop: '1rem', background: 'none', border: 'none', textDecoration: 'underline', color: 'inherit', cursor: 'pointer' }}>Send another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {status === "error" && (
                                    <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '4px', fontSize: '0.9rem' }}>
                                        {errorMsg}
                                    </div>
                                )}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>{dict.contact.form.name}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                        placeholder=""
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>{dict.contact.form.email}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                        placeholder=""
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>{dict.contact.form.msg}</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                        minLength={10}
                                        style={{ width: '100%', padding: '0.8rem', border: '1px solid #ddd', borderRadius: '4px', height: '120px' }}
                                        placeholder=""
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                                    {loading ? "Sending..." : dict.contact.form.btn}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

