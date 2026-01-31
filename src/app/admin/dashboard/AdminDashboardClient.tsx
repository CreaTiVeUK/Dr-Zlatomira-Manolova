
"use client";

import { format } from "date-fns";
import Link from "next/link";
import {
    PieChart, Pie, Cell, Legend, AreaChart, Area,
    ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { Search, Bell, MessageSquare, Sun, Moon } from "lucide-react";

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

    return (
        <div style={{ fontFamily: '"Open Sans", sans-serif' }}>
            {/* TOP BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', width: '60%' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} size={20} />
                    <input
                        type="text"
                        placeholder="Search"
                        style={{
                            width: '100%',
                            padding: '0.8rem 1rem 0.8rem 3rem',
                            borderRadius: '50px',
                            border: 'none',
                            background: 'white',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ padding: '0.6rem', background: 'white', borderRadius: '12px', cursor: 'pointer' }}><Bell size={20} color="#666" /></div>
                    <div style={{ padding: '0.6rem', background: 'white', borderRadius: '12px', cursor: 'pointer' }}><MessageSquare size={20} color="#666" /></div>
                    <div style={{ display: 'flex', background: 'white', borderRadius: '20px', padding: '0.3rem' }}>
                        <div style={{ padding: '0.3rem', background: '#F59E0B', borderRadius: '50%', color: 'white' }}><Sun size={16} /></div>
                        <div style={{ padding: '0.3rem', color: '#ccc' }}><Moon size={16} /></div>
                    </div>
                </div>
            </div>

            {/* METRICS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <MetricCard title="Appointments" value={stats.appointments} change="-4.3%" color="#3182CE" />
                <MetricCard title="Total Patients" value={stats.patients} change="+6.5%" color="white" darkText />
                <MetricCard title="Admitted Patients" value={stats.admitted} change="+6.5%" color="white" darkText />
                <MetricCard title="Total Revenue" value={`£${stats.revenue}`} change="+12%" color="white" darkText />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* PATIENT LIST */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Patient List</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: '#888', borderBottom: '1px solid #eee' }}>
                                <th style={{ padding: '0.8rem 0' }}>Name</th>
                                <th style={{ padding: '0.8rem 0' }}>Date</th>
                                <th style={{ padding: '0.8rem 0' }}>Type</th>
                                <th style={{ padding: '0.8rem 0' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPatients.map((p, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                    <td style={{ padding: '0.8rem 0', fontWeight: '600' }}>{p.name}</td>
                                    <td style={{ padding: '0.8rem 0', color: '#666' }}>{p.date}</td>
                                    <td style={{ padding: '0.8rem 0', color: '#3182CE' }}>{p.type}</td>
                                    <td style={{ padding: '0.8rem 0' }}>{p.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* CALENDAR / UPCOMING (Simplified) */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Upcoming Queue</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {upcoming.length === 0 ? <p style={{ color: '#ccc' }}>No upcoming appointments</p> : upcoming.slice(0, 3).map((apt, i) => (
                            <div key={i} style={{ padding: '1rem', background: '#F8FAFC', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
                                    <span>{apt.time}</span>
                                    <span style={{ fontWeight: '700', color: '#0F4C81' }}>{apt.type}</span>
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{apt.patient}</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>{apt.reason || 'General Checkup'}</div>
                                <button style={{ marginTop: '0.8rem', width: '100%', padding: '0.4rem', background: '#3182CE', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>View Details</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CHARTS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
                {/* PIE CHART */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700', alignSelf: 'flex-start' }}>Appointment Types</h3>
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
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* LINE CHART */}
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>Monthly Patients Visit</h3>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <AreaChart data={monthlyVisits}>
                                <defs>
                                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3182CE" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3182CE" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                                <CartesianGrid vertical={false} stroke="#eee" />
                                <Tooltip />
                                <Area type="monotone" dataKey="patients" stroke="#3182CE" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change, color, darkText = false }: { title: string, value: string | number, change: string, color: string, darkText?: boolean }) {
    const textColor = darkText ? '#1E293B' : 'white';
    const subColor = darkText ? '#64748B' : 'rgba(255,255,255,0.7)';
    const bg = color === 'white' ? 'white' : color;

    return (
        <div style={{
            background: bg,
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            color: textColor
        }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600' }}>{title}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>{value}</div>
            <div style={{ fontSize: '0.8rem', color: subColor }}>
                <span style={{ color: change.startsWith('+') ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>{change}</span> then last month
            </div>
        </div>
    );
}
