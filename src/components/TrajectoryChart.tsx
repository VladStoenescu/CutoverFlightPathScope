import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Legend,
} from 'recharts';
import { computeDerivedMetrics } from '../models';
import type { CutoverEvent } from '../models';

interface Props {
  events: CutoverEvent[];
}

export const TrajectoryChart: React.FC<Props> = ({ events }) => {
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

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          labelStyle={{ color: '#f1f5f9' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        <ReferenceLine y={100} stroke="#10b981" strokeDasharray="6 3" label={{ value: '100% Target', fill: '#10b981', fontSize: 10 }} />
        <Line type="monotone" dataKey="Overall" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="Scope" stroke="#06b6d4" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="Quantitative" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="Qualitative" stroke="#ec4899" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
};
