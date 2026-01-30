
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useRouter } from "next/navigation";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface Child {
    id: string;
    name: string;
    birthDate: string;
    gender: string;
    notes?: string;
}

interface Document {
    id: string;
    name: string;
    uploadedAt: string;
    fileSize: number;
    fileType: string;
}

export default function ProfilePage() {
    const { status } = useSession();
    const { dict } = useLanguage();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const [documents, setDocuments] = useState<Document[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [isAddingChild, setIsAddingChild] = useState(false);
    const [childForm, setChildForm] = useState({ name: "", birthDate: "", gender: "M", notes: "" });

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
            Promise.all([
                fetch("/api/user/profile").then(res => res.json()),
                fetch("/api/user/children").then(res => res.json()),
                fetch("/api/user/documents").then(res => res.json())
            ])
                .then(([profile, childrenData, docsData]) => {
                    if (profile.error) throw new Error(profile.error);
                    setFormData({
                        name: profile.name || "",
                        email: profile.email || "",
                        phone: profile.phone || ""
                    });

                    if (Array.isArray(childrenData)) setChildren(childrenData);
                    if (Array.isArray(docsData)) setDocuments(docsData);
                })
                .catch(err => {
                    console.error(err);
                    setMessage({ text: dict.booking.error || "Error loading profile", type: "error" });
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [status, router, dict.booking.error]);

    const handleAddChild = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/user/children", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(childForm)
            });
            const newChild = await res.json();
            if (!res.ok) throw new Error(newChild.error);

            setChildren([newChild, ...children]);
            setIsAddingChild(false);
            setChildForm({ name: "", birthDate: "", gender: "M", notes: "" });
            setMessage({ text: "Child added successfully", type: "success" });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error adding child";
            setMessage({ text: errorMessage, type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteChild = async (id: string) => {
        if (!confirm("Are you sure you want to remove this child profile?")) return;
        try {
            const res = await fetch(`/api/user/children?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            setChildren(children.filter(c => c.id !== id));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error deleting child");
        }
    };

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
                            <PhoneInput
                                country={'bg'}
                                value={formData.phone}
                                onChange={phone => setFormData({ ...formData, phone })}
                                inputStyle={{
                                    width: '100%',
                                    height: '42px',
                                    fontSize: '16px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px'
                                }}
                                buttonStyle={{
                                    border: '1px solid #ddd',
                                    borderRight: 'none',
                                    borderTopLeftRadius: '6px',
                                    borderBottomLeftRadius: '6px',
                                    background: '#f8fafc'
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
                    {/* CHILDREN SECTION */}
                    <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-charcoal)', margin: 0 }}>Children Profiles</h2>
                            <button
                                type="button"
                                onClick={() => setIsAddingChild(!isAddingChild)}
                                className="btn btn-outline"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                            >
                                {isAddingChild ? 'Cancel' : '+ Add Child'}
                            </button>
                        </div>

                        {isAddingChild && (
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                                <form onSubmit={handleAddChild}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={childForm.name}
                                            onChange={e => setChildForm({ ...childForm, name: e.target.value })}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>Date of Birth</label>
                                            <input
                                                type="date"
                                                required
                                                value={childForm.birthDate}
                                                onChange={e => setChildForm({ ...childForm, birthDate: e.target.value })}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>Gender</label>
                                            <select
                                                value={childForm.gender}
                                                onChange={e => setChildForm({ ...childForm, gender: e.target.value })}
                                                style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                            >
                                                <option value="M">Boy</option>
                                                <option value="F">Girl</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Child Profile'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {children.length === 0 ? (
                            <p style={{ color: '#999', textAlign: 'center', fontSize: '0.9rem' }}>No children profiles added yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {children.map((child: Child) => (
                                    <div key={child.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fff', border: '1px solid #eee', borderRadius: '6px' }}>
                                        <div>
                                            <div style={{ fontWeight: '700', color: 'var(--text-charcoal)' }}>{child.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                                {new Date(child.birthDate).toLocaleDateString()} • {child.gender === 'M' ? 'Boy' : 'Girl'}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteChild(child.id)}
                                            style={{ color: '#c62828', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DOCUMENTS SECTION */}
                    <div style={{ marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--text-charcoal)', marginBottom: '1.5rem' }}>Medical Documents</h2>

                        {documents.length === 0 ? (
                            <p style={{ color: '#999', textAlign: 'center', fontSize: '0.9rem' }}>No documents uploaded by your doctor yet.</p>
                        ) : (
                            <div className="table-responsive">
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: "2px solid #eee", textAlign: "left", color: 'var(--text-muted)' }}>
                                            <th style={{ padding: "0.8rem" }}>Date</th>
                                            <th style={{ padding: "0.8rem" }}>Document</th>
                                            <th style={{ padding: "0.8rem", textAlign: 'right' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {documents.map((doc: Document) => (
                                            <tr key={doc.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                                <td style={{ padding: "0.8rem", color: '#666' }}>
                                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: "0.8rem", fontWeight: '600' }}>
                                                    {doc.name}
                                                </td>
                                                <td style={{ padding: "0.8rem", textAlign: 'right' }}>
                                                    <a
                                                        href={`/api/documents/${doc.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', textDecoration: 'none' }}
                                                    >
                                                        Download
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
