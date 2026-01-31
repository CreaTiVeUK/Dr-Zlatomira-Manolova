

"use client";

import { useState, useEffect } from "react";


import { useTheme } from "next-themes";
import {
    PieChart, Pie, Cell, Legend, AreaChart, Area,
    ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Search, Bell, MessageSquare, Sun, Moon, Check } from "lucide-react";

interface DashboardProps {
    stats: {
        appointments: number;
        patients: number;
        admitted: number;
        revenue: number;
    };
    upcoming: {
        time: string;
        patient: string;
        reason: string | null;
        type: string;
    }[];
    monthlyVisits: {
        name: string;
        patients: number;
    }[];
    appointmentTypes: {
        name: string;
        value: number;
    }[];
    recentPatients: {
        name: string;
        date: string;
        type: string;
        status: string;
    }[];
}

const COLORS = ['#0F4C81', '#F59E0B', '#3182CE', '#10B981'];

export default function AdminDashboardClient({ stats, upcoming, monthlyVisits, appointmentTypes, recentPatients }: DashboardProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, text: "New appointment request from P. Parker", read: false },
        { id: 2, text: "Lab results ready for M. Jane", read: false },
        { id: 3, text: "System maintenance scheduled tonight", read: true },
    ]);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;
    }

    const isDark = theme === 'dark';

    // Styles
    const bgMain = isDark ? '#111827' : '#F3F4F6'; // gray-900 : gray-100
    const bgCard = isDark ? '#1F2937' : 'white';   // gray-800 : white
    const textMain = isDark ? '#F9FAFB' : '#1F2937'; // gray-50 : gray-800
    const textSec = isDark ? '#9CA3AF' : '#6B7280';  // gray-400 : gray-500
    const border = isDark ? '#374151' : '#E5E7EB';   // gray-700 : gray-200

    // Filter Logic
    const filteredPatients = recentPatients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUpcoming = upcoming.filter(a =>
        a.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
    const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);
    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <div style={{ fontFamily: '"Open Sans", sans-serif', color: textMain, minHeight: '100%', transition: 'background-color 0.3s, color 0.3s' }}>
            {/* TOP BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', width: '60%' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: textSec }} size={20} />
                    <input
                        type="text"
                        placeholder="Search patients, appointments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.8rem 1rem 0.8rem 3rem',
                            borderRadius: '50px',
                            border: `1px solid ${border}`,
                            background: bgCard,
                            color: textMain,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                            outline: 'none'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative' }}>
                    {/* Notification Button */}
                    <button
                        onClick={toggleNotifications}
                        style={{ padding: '0.6rem', background: bgCard, borderRadius: '12px', cursor: 'pointer', border: `1px solid ${border}`, position: 'relative' }}
                    >
                        <Bell size={20} color={textSec} />
                        {notifications.some(n => !n.read) && (
                            <span style={{ position: 'absolute', top: -2, right: -2, width: '10px', height: '10px', background: '#EF4444', borderRadius: '50%' }} />
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {notificationsOpen && (
                        <div style={{
                            position: 'absolute', top: '120%', right: 0, width: '300px',
                            background: bgCard, border: `1px solid ${border}`, borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden'
                        }}>
                            <div style={{ padding: '1rem', borderBottom: `1px solid ${border}`, fontWeight: 'bold' }}>Notifications</div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '1rem', color: textSec, textAlign: 'center' }}>No notifications</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} style={{ padding: '0.8rem 1rem', borderBottom: `1px solid ${border}`, opacity: n.read ? 0.6 : 1, display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '0.5rem' }}>
                                            <span style={{ fontSize: '0.9rem' }}>{n.text}</span>
                                            {!n.read && (
                                                <button onClick={() => markAsRead(n.id)} title="Mark as read" style={{ color: '#3182CE', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                    <Check size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ padding: '0.6rem', background: bgCard, borderRadius: '12px', cursor: 'pointer', border: `1px solid ${border}` }}>
                        <MessageSquare size={20} color={textSec} />
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{ display: 'flex', background: bgCard, borderRadius: '20px', padding: '0.3rem', border: `1px solid ${border}`, cursor: 'pointer' }}
                    >
                        <div style={{ padding: '0.3rem', background: !isDark ? '#F59E0B' : 'transparent', borderRadius: '50%', color: !isDark ? 'white' : textSec, transition: 'all 0.2s' }}>
                            <Sun size={16} />
                        </div>
                        <div style={{ padding: '0.3rem', background: isDark ? '#3182CE' : 'transparent', borderRadius: '50%', color: isDark ? 'white' : textSec, transition: 'all 0.2s' }}>
                            <Moon size={16} />
                        </div>
                    </button>
                </div>
            </div>

            {/* METRICS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <MetricCard title="Appointments" value={stats.appointments} change="-4.3%" color="#3182CE" isDark={isDark} />
                <MetricCard title="Total Patients" value={stats.patients} change="+6.5%" color={bgCard} darkText={!isDark} isDark={isDark} />
                <MetricCard title="Admitted Patients" value={stats.admitted} change="+6.5%" color={bgCard} darkText={!isDark} isDark={isDark} />
                <MetricCard title="Total Revenue" value={`£${stats.revenue}`} change="+12%" color={bgCard} darkText={!isDark} isDark={isDark} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* PATIENT LIST */}
                <div style={{ background: bgCard, padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: `1px solid ${border}` }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Patient List</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: textSec, borderBottom: `1px solid ${border}` }}>
                                <th style={{ padding: '0.8rem 0' }}>Name</th>
                                <th style={{ padding: '0.8rem 0' }}>Date</th>
                                <th style={{ padding: '0.8rem 0' }}>Type</th>
                                <th style={{ padding: '0.8rem 0' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.length > 0 ? filteredPatients.map((p, i) => (
                                <tr key={i} style={{ borderBottom: `1px solid ${isDark ? '#374151' : '#f9f9f9'}` }}>
                                    <td style={{ padding: '0.8rem 0', fontWeight: '600' }}>{p.name}</td>
                                    <td style={{ padding: '0.8rem 0', color: textSec }}>{p.date}</td>
                                    <td style={{ padding: '0.8rem 0', color: '#3182CE' }}>{p.type}</td>
                                    <td style={{ padding: '0.8rem 0' }}>{p.status}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: textSec }}>No patients found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* CALENDAR / UPCOMING */}
                <div style={{ background: bgCard, padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: `1px solid ${border}` }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Upcoming Queue</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredUpcoming.length === 0 ?
                            <p style={{ color: textSec }}>No upcoming appointments</p> :
                            filteredUpcoming.slice(0, 5).map((apt, i) => (
                                <div key={i} style={{ padding: '1rem', background: isDark ? '#111827' : '#F8FAFC', borderRadius: '8px', border: `1px solid ${border}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: textSec, marginBottom: '0.5rem' }}>
                                        <span>{apt.time}</span>
                                        <span style={{ fontWeight: '700', color: '#0F4C81' }}>{apt.type}</span>
                                    </div>
                                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{apt.patient}</div>
                                    <div style={{ fontSize: '0.8rem', color: textSec }}>{apt.reason || 'General Checkup'}</div>
                                    <button style={{ marginTop: '0.8rem', width: '100%', padding: '0.4rem', background: '#3182CE', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>View Details</button>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {/* CHARTS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                {/* PIE CHART */}
                <div style={{ background: bgCard, padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${border}` }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700', alignSelf: 'flex-start' }}>Appointment Types</h3>
                    {appointmentTypes.length === 0 ? (
                        <div style={{ color: textSec }}>No data</div>
                    ) : (
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={appointmentTypes}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {appointmentTypes.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: bgCard, borderColor: border, color: textMain }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* LINE CHART */}
                <div style={{ background: bgCard, padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: `1px solid ${border}` }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Monthly Patients Visit</h3>
                    {monthlyVisits.length === 0 ? (
                        <div style={{ color: textSec }}>No data</div>
                    ) : (
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <AreaChart data={monthlyVisits}>
                                    <defs>
                                        <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3182CE" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3182CE" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textSec, fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: textSec, fontSize: 12 }} />
                                    <CartesianGrid vertical={false} stroke={border} />
                                    <Tooltip contentStyle={{ backgroundColor: bgCard, borderColor: border, color: textMain }} />
                                    <Area type="monotone" dataKey="patients" stroke="#3182CE" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change, color, darkText = false, isDark = false }: { title: string, value: string | number, change: string, color: string, darkText?: boolean, isDark?: boolean }) {
    const textColor = darkText ? (isDark ? '#F9FAFB' : '#1E293B') : 'white';
    const subColor = darkText ? (isDark ? '#9CA3AF' : '#64748B') : 'rgba(255,255,255,0.7)';
    const bg = color;

    return (
        <div style={{
            background: bg,
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            color: textColor,
            border: isDark && darkText ? '1px solid #374151' : 'none'
        }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600' }}>{title}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: subColor }}>
                <span style={{ color: change.startsWith('+') ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>{change}</span> then last month
            </div>
        </div>
    );
}
