"use client";

import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type Monthly = { key: string; label: string; visits: number; revenue: number };
type Dow = { label: string; visits: number };

export default function AnalyticsCharts({
    monthly,
    byDayOfWeek,
    labels,
}: {
    monthly: Monthly[];
    byDayOfWeek: Dow[];
    labels: {
        monthlyTitle: string;
        monthlyVisits: string;
        monthlyRevenue: string;
        dowTitle: string;
    };
}) {
    return (
        <div className="admin-grid admin-grid--two" style={{ marginTop: "1.5rem" }}>
            <div className="admin-panel">
                <div className="admin-panel__header">
                    <strong style={{ fontFamily: "var(--font-heading)" }}>{labels.monthlyTitle}</strong>
                </div>
                <div className="admin-panel__body" style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                            <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="left" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                            <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: "var(--surface-page)", border: "1px solid var(--border)", borderRadius: 12 }} />
                            <Line yAxisId="left" type="monotone" dataKey="visits" name={labels.monthlyVisits} stroke="var(--primary-teal)" strokeWidth={2} dot={{ r: 3 }} />
                            <Line yAxisId="right" type="monotone" dataKey="revenue" name={labels.monthlyRevenue} stroke="var(--accent-gold)" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="admin-panel">
                <div className="admin-panel__header">
                    <strong style={{ fontFamily: "var(--font-heading)" }}>{labels.dowTitle}</strong>
                </div>
                <div className="admin-panel__body" style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={byDayOfWeek}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                            <XAxis dataKey="label" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                            <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: "var(--surface-page)", border: "1px solid var(--border)", borderRadius: 12 }} />
                            <Bar dataKey="visits" fill="var(--primary-teal)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
