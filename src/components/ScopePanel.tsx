import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { CutoverEvent } from '../models';

interface Props {
  events: CutoverEvent[];
}

export const ScopePanel: React.FC<Props> = ({ events }) => {
  // Show latest event scope
  const latest = events[events.length - 1];
  if (!latest) return <div className="text-slate-500 text-sm">No events yet.</div>;

  const data = [
    {
      name: 'Runbook',
      Planned: latest.scope.runbookScopePctPlanned,
      Actual: latest.scope.runbookScopePctActual,
    },
    {
      name: 'Migration',
      Planned: latest.scope.migrationScopePctPlanned,
      Actual: latest.scope.migrationScopePctActual,
    },
    {
      name: 'Applications',
      Planned: latest.scope.applicationsScopePctPlanned,
      Actual: latest.scope.applicationsScopePctActual,
    },
    {
      name: 'Legacy ID',
      Planned: latest.scope.legacyIdConversionScopePctPlanned,
      Actual: latest.scope.legacyIdConversionScopePctActual,
    },
  ];

  return (
    <div data-export-id="scope-chart">
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
          labelStyle={{ color: '#f1f5f9' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        <Bar dataKey="Planned" fill="#6366f1" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Actual" fill="#10b981" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
};
