import { subMonths } from "date-fns";
import { TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/i18n/server";
import AnalyticsCharts from "./AnalyticsCharts";

export const dynamic = "force-dynamic";

type MonthBucket = { key: string; label: string; visits: number; revenue: number };

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminAnalyticsPage() {
  const { dict, language } = await getServerDictionary();
  const copy = dict.admin.analyticsPage;

  const now = new Date();
  const twelveMonthsAgo = subMonths(now, 11);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const priorThirtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [allAppointments, completedThisMonth, patientCount, newPatientsLast30, newPatientsPrior30] = await Promise.all([
    prisma.appointment.findMany({
      where: { dateTime: { gte: twelveMonthsAgo } },
      select: { dateTime: true, status: true, paymentStatus: true, price: true, duration: true, userId: true },
    }),
    prisma.appointment.count({
      where: {
        dateTime: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        status: "COMPLETED",
      },
    }),
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.user.count({ where: { role: "PATIENT", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({
      where: { role: "PATIENT", createdAt: { gte: priorThirtyDaysAgo, lt: thirtyDaysAgo } },
    }),
  ]);

  // ── 12-month visits + revenue ────────────────────────────────────────────
  const bucketsMap = new Map<string, MonthBucket>();
  for (let i = 11; i >= 0; i--) {
    const d = subMonths(now, i);
    const key = monthKey(d);
    bucketsMap.set(key, {
      key,
      label: d.toLocaleString(language === "bg" ? "bg-BG" : "en-GB", { month: "short" }),
      visits: 0,
      revenue: 0,
    });
  }
  for (const appt of allAppointments) {
    const bucket = bucketsMap.get(monthKey(appt.dateTime));
    if (!bucket) continue;
    if (appt.status !== "CANCELLED") bucket.visits += 1;
    if (appt.paymentStatus === "PAID") bucket.revenue += appt.price;
  }
  const monthly = Array.from(bucketsMap.values());

  // ── Day-of-week distribution ─────────────────────────────────────────────
  const dowLabels = language === "bg"
    ? ["Нед", "Пон", "Вт", "Ср", "Чет", "Пет", "Съб"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const byDayOfWeek = dowLabels.map((label) => ({ label, visits: 0 }));
  for (const appt of allAppointments) {
    if (appt.status === "CANCELLED") continue;
    byDayOfWeek[appt.dateTime.getDay()].visits += 1;
  }

  // ── Cancellation rate ────────────────────────────────────────────────────
  const total = allAppointments.length;
  const cancelled = allAppointments.filter((a) => a.status === "CANCELLED").length;
  const cancellationRate = total === 0 ? 0 : (cancelled / total) * 100;

  // ── Average appointments per patient ─────────────────────────────────────
  const perPatient = new Map<string, number>();
  for (const appt of allAppointments) {
    if (appt.status === "CANCELLED") continue;
    perPatient.set(appt.userId, (perPatient.get(appt.userId) ?? 0) + 1);
  }
  const avgAppointments = perPatient.size === 0 ? 0 : total / perPatient.size;

  // ── Top patients by visits (top 10) ──────────────────────────────────────
  const topPatientIds = Array.from(perPatient.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const topPatientUsers = topPatientIds.length
    ? await prisma.user.findMany({
        where: { id: { in: topPatientIds.map(([id]) => id) } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const topPatients = topPatientIds.map(([id, count]) => {
    const u = topPatientUsers.find((x) => x.id === id);
    return { id, name: u?.name ?? u?.email ?? copy.unknownPatient, visits: count };
  });

  // ── Patient growth (30d vs prior 30d) ────────────────────────────────────
  const growthDelta = newPatientsPrior30 === 0
    ? newPatientsLast30 > 0 ? 100 : 0
    : ((newPatientsLast30 - newPatientsPrior30) / newPatientsPrior30) * 100;

  const totalRevenue12m = monthly.reduce((s, m) => s + m.revenue, 0);

  const kpis = [
    { label: copy.kpi.totalPatients, value: patientCount.toLocaleString() },
    { label: copy.kpi.newLast30, value: newPatientsLast30.toLocaleString(), delta: growthDelta },
    { label: copy.kpi.completedThisMonth, value: completedThisMonth.toLocaleString() },
    { label: copy.kpi.cancellationRate, value: `${cancellationRate.toFixed(1)}%` },
    { label: copy.kpi.avgPerPatient, value: avgAppointments.toFixed(1) },
    { label: copy.kpi.revenue12m, value: `${totalRevenue12m.toLocaleString()} ${language === "bg" ? "лв." : "BGN"}` },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="admin-page-header__copy">
          <span className="page-intro__eyebrow">{copy.eyebrow}</span>
          <h1 className="section-title">{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </div>
      </div>

      <div className="admin-skeleton-grid" style={{ animation: "none" }}>
        {kpis.map((k) => (
          <div key={k.label} className="admin-note-box">
            <span className="helper-text">{k.label}</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginTop: "0.25rem" }}>
              <strong style={{ fontFamily: "var(--font-heading)", fontSize: "1.6rem" }}>{k.value}</strong>
              {typeof k.delta === "number" && (
                <span
                  className={`status-chip ${k.delta >= 0 ? "status-chip--success" : "status-chip--warning"}`}
                  style={{ fontSize: "0.75rem" }}
                >
                  <TrendingUp size={12} style={{ marginRight: 4 }} />
                  {k.delta >= 0 ? "+" : ""}{k.delta.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnalyticsCharts
        monthly={monthly}
        byDayOfWeek={byDayOfWeek}
        labels={{
          monthlyTitle: copy.charts.monthlyTitle,
          monthlyVisits: copy.charts.visits,
          monthlyRevenue: copy.charts.revenue,
          dowTitle: copy.charts.dowTitle,
        }}
      />

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <strong style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem" }}>{copy.topPatients.title}</strong>
            <p className="helper-text">{copy.topPatients.subtitle}</p>
          </div>
        </div>
        <div className="admin-panel__body">
          {topPatients.length === 0 ? (
            <p className="helper-text">{copy.topPatients.empty}</p>
          ) : (
            <table className="table-modern">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{copy.topPatients.columns.patient}</th>
                  <th>{copy.topPatients.columns.visits}</th>
                </tr>
              </thead>
              <tbody>
                {topPatients.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>
                      <a href={`/admin/users/${p.id}`}>{p.name}</a>
                    </td>
                    <td>{p.visits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
