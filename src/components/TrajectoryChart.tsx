import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer, Legend,
} from 'recharts';
import { computeDerivedMetrics } from '../models';
import type { CutoverEvent } from '../models';

interface Props {
  events: CutoverEvent[];
  goLiveWindowStart?: string;
  goLiveWindowEnd?: string;
}

export const TrajectoryChart: React.FC<Props> = ({ events, goLiveWindowStart, goLiveWindowEnd }) => {
  const data = events.map((e) => {
    const m = computeDerivedMetrics(e);
    return {
      name: e.name,
      Overall: m.overallReadinessPct,
      Scope: m.scopeReadinessPct,
      Quantitative: m.quantitativeReadinessPct,
      Qualitative: m.qualitativeReadinessPct,
    };
  });

  // Find data keys matching the go-live window dates using proper Date comparison
  const startName = goLiveWindowStart
    ? events.find(e => e.date && new Date(e.date + 'T00:00:00') >= new Date(goLiveWindowStart! + 'T00:00:00'))?.name
    : undefined;
  const endName = goLiveWindowEnd
    ? events.slice().reverse().find(e => e.date && new Date(e.date + 'T00:00:00') <= new Date(goLiveWindowEnd! + 'T00:00:00'))?.name
    : undefined;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-800" />
        <XAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#4B5563', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
          labelStyle={{ color: '#111827' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#4B5563' }} />
        {startName && endName && (
          <ReferenceArea x1={startName} x2={endName} fill="#C9A227" fillOpacity={0.15} label={{ value: 'Go-Live Window', fill: '#C9A227', fontSize: 10 }} />
        )}
        <ReferenceLine y={100} stroke="#16A34A" strokeDasharray="6 3" label={{ value: '100% Target', fill: '#16A34A', fontSize: 10 }} />
        <Line type="monotone" dataKey="Overall" stroke="#1F4E79" strokeWidth={2.5} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="Scope" stroke="#2AA7A1" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="Quantitative" stroke="#F59E0B" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="Qualitative" stroke="#DC2626" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
};
