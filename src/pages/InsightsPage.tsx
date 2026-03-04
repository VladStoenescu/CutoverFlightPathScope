import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ReferenceLine,
} from 'recharts';
import { useApp } from '../contexts/AppContext';
import { computeDerivedMetrics } from '../models';

export const InsightsPage: React.FC = () => {
  const { state, sortedEvents } = useApp();

  // ── 1. Readiness Decomposition ───────────────────────────────────────────────
  const decompositionData = sortedEvents.map(e => {
    const m = computeDerivedMetrics(e);
    return {
      name: e.name,
      Scope: m.scopeReadinessPct,
      Quantitative: m.quantitativeReadinessPct,
      Qualitative: m.qualitativeReadinessPct,
    };
  });

  // ── 2. Trajectory Forecast ───────────────────────────────────────────────────
  const trajectoryData = useMemo(() => {
    type TrajectoryPoint = { name: string; Overall: number | null; Projected: number | null };
    const points: TrajectoryPoint[] = sortedEvents.map(e => ({
      name: e.name,
      Overall: computeDerivedMetrics(e).overallReadinessPct,
      Projected: null,
    }));

    let projectedAtGoLive: number | null = null;
    let requiredImprovement: number | null = null;

    if (points.length >= 2) {
      const last = points[points.length - 1].Overall ?? 0;
      const prev = points[points.length - 2].Overall ?? 0;
      const slope = last - prev;
      const goLiveDate = state.config.goLiveDate;
      const lastEventDate = sortedEvents[sortedEvents.length - 1].date;

      if (goLiveDate && lastEventDate) {
        const daysLeft = Math.ceil(
          (new Date(goLiveDate + 'T00:00:00').getTime() - new Date(lastEventDate + 'T00:00:00').getTime()) /
          (1000 * 60 * 60 * 24)
        );
        const eventsLeft = Math.max(1, Math.round(daysLeft / 30));
        projectedAtGoLive = Math.min(100, Math.round(last + slope * eventsLeft));
        const gap = 100 - last;
        requiredImprovement = eventsLeft > 0 ? Math.round(gap / eventsLeft) : gap;
        points.push({ name: 'Go-Live ⭐', Overall: null, Projected: projectedAtGoLive });
      }
    }

    return { points, projectedAtGoLive, requiredImprovement };
  }, [sortedEvents, state.config.goLiveDate]);

  // ── 3. Quality Stability Index ───────────────────────────────────────────────
  const stabilityData = sortedEvents.map(e => {
    const q = e.qualitative;
    const defectRatio = q.expectedOpenDefects > 0
      ? Math.min(100, (q.actualOpenDefects / q.expectedOpenDefects) * 100) : 0;
    const breakRatio = q.expectedReconciliationBreaks > 0
      ? Math.min(100, (q.actualReconciliationBreaks / q.expectedReconciliationBreaks) * 100) : 0;
    const signoffPct = q.topicsTotalCount > 0
      ? (q.topicsSignedOffCount / q.topicsTotalCount) * 100 : 0;
    const stability = Math.round(100 - (defectRatio + breakRatio + (100 - signoffPct)) / 3);
    return { name: e.name, Stability: Math.max(0, stability) };
  });

  // ── 4. Plan vs Actual Delta Heatmap ─────────────────────────────────────────
  const heatmapMetrics = [
    { key: 'Runbook', planned: (e: typeof sortedEvents[0]) => e.scope.runbookScopePctPlanned, actual: (e: typeof sortedEvents[0]) => e.scope.runbookScopePctActual },
    { key: 'Migration', planned: (e: typeof sortedEvents[0]) => e.scope.migrationScopePctPlanned, actual: (e: typeof sortedEvents[0]) => e.scope.migrationScopePctActual },
    { key: 'Apps', planned: (e: typeof sortedEvents[0]) => e.scope.applicationsScopePctPlanned, actual: (e: typeof sortedEvents[0]) => e.scope.applicationsScopePctActual },
    { key: 'Legacy ID', planned: (e: typeof sortedEvents[0]) => e.scope.legacyIdConversionScopePctPlanned, actual: (e: typeof sortedEvents[0]) => e.scope.legacyIdConversionScopePctActual },
    {
      key: 'Records %',
      planned: () => 100, // target is 100% migration
      actual: (e: typeof sortedEvents[0]) => {
        const r = e.quantitative.records;
        const total = r.referenceDataPlanned + r.staticDataPlanned + r.transactionPositionPlanned + r.inflightDataPlanned;
        const act = r.referenceDataActual + r.staticDataActual + r.transactionPositionActual + r.inflightDataActual;
        return total > 0 ? Math.round((act / total) * 100) : 0;
      },
    },
    {
      key: 'Runtime Var',
      planned: () => 0,
      actual: (e: typeof sortedEvents[0]) => {
        const rt = e.quantitative.runtime;
        if (!rt.expectedRunbookRuntimeMinutes) return 0;
        return Math.round(((rt.actualRunbookRuntimeMinutes - rt.expectedRunbookRuntimeMinutes) / rt.expectedRunbookRuntimeMinutes) * 100);
      },
    },
  ];

  function deltaColor(delta: number): string {
    if (delta >= 0) return '#dcfce7'; // green
    if (delta >= -10) return '#fef9c3'; // yellow
    return '#fee2e2'; // red
  }
  function deltaTextColor(delta: number): string {
    if (delta >= 0) return '#15803d';
    if (delta >= -10) return '#854d0e';
    return '#b91c1c';
  }

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-16 text-n-600 dark:text-slate-500">
        No events yet. Add DRH or MDR events to see insights.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold text-n-900 dark:text-slate-200">📊 Insights</h1>

      {/* 1. Readiness Decomposition */}
      <section className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-n-600 dark:text-slate-400 uppercase tracking-wider mb-4">1 · Readiness Decomposition per Event</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={decompositionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#4B5563', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Scope" stackId="a" fill="#2AA7A1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Quantitative" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Qualitative" stackId="a" fill="#6366f1" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* 2. Trajectory Forecast */}
      <section className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-n-600 dark:text-slate-400 uppercase tracking-wider mb-2">2 · Trajectory Forecast</h2>
        {trajectoryData.projectedAtGoLive !== null && (
          <div className="flex gap-4 mb-3 text-sm flex-wrap">
            <span className="text-n-600 dark:text-slate-400">
              Projected at Go-Live: <strong className="text-indigo-600 dark:text-indigo-300">{trajectoryData.projectedAtGoLive}%</strong>
            </span>
            <span className="text-n-600 dark:text-slate-400">
              Required improvement/event: <strong className="text-amber-600 dark:text-amber-300">+{trajectoryData.requiredImprovement}%</strong>
            </span>
          </div>
        )}
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trajectoryData.points} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#4B5563', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={100} stroke="#16A34A" strokeDasharray="6 3" label={{ value: '100% Target', fill: '#16A34A', fontSize: 10 }} />
            <Line type="monotone" dataKey="Overall" stroke="#1F4E79" strokeWidth={2.5} dot={{ r: 4 }} connectNulls={false} />
            <Line type="monotone" dataKey="Projected" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 4 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* 3. Quality Stability Index */}
      <section className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-n-600 dark:text-slate-400 uppercase tracking-wider mb-2">3 · Quality Stability Index</h2>
        <div className="flex gap-3 text-xs mb-3 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">{'>'} 80 — Good</span>
          <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">60-80 — Warning</span>
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">{'<'} 60 — Critical</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stabilityData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: '#4B5563', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }} />
            <ReferenceLine y={80} stroke="#16A34A" strokeDasharray="4 2" label={{ value: '80', fill: '#16A34A', fontSize: 9 }} />
            <ReferenceLine y={60} stroke="#F59E0B" strokeDasharray="4 2" label={{ value: '60', fill: '#F59E0B', fontSize: 9 }} />
            <Line type="monotone" dataKey="Stability" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* 4. Plan vs Actual Delta Heatmap */}
      <section className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-n-600 dark:text-slate-400 uppercase tracking-wider mb-4">4 · Plan vs Actual Delta Heatmap</h2>
        <div className="overflow-x-auto">
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left px-2 py-1.5 text-n-600 dark:text-slate-400 border-b border-n-200 dark:border-slate-700">Event</th>
                {heatmapMetrics.map(m => (
                  <th key={m.key} className="px-2 py-1.5 text-n-600 dark:text-slate-400 border-b border-n-200 dark:border-slate-700 text-center whitespace-nowrap">{m.key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map(e => (
                <tr key={e.id} className="border-b border-n-200 dark:border-slate-800 last:border-0">
                  <td className="px-2 py-1.5 font-medium text-n-900 dark:text-slate-200 whitespace-nowrap">{e.name}</td>
                  {heatmapMetrics.map(m => {
                    const delta = m.actual(e) - m.planned(e);
                    return (
                      <td
                        key={m.key}
                        className="px-2 py-1.5 text-center font-semibold rounded"
                        style={{ background: deltaColor(delta), color: deltaTextColor(delta) }}
                      >
                        {delta >= 0 ? '+' : ''}{delta}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
