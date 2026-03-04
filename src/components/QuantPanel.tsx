import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { CutoverEvent } from '../models';
import { getRuntimeVariancePct } from '../models';

interface Props {
  events: CutoverEvent[];
}

export const QuantPanel: React.FC<Props> = ({ events }) => {
  const latest = events[events.length - 1];
  if (!latest) return <div className="text-slate-500 text-sm">No events yet.</div>;

  const recordsData = [
    {
      name: 'Reference',
      Planned: latest.quantitative.records.referenceDataPlanned,
      Actual: latest.quantitative.records.referenceDataActual,
    },
    {
      name: 'Static',
      Planned: latest.quantitative.records.staticDataPlanned,
      Actual: latest.quantitative.records.staticDataActual,
    },
    {
      name: 'Txn+Pos',
      Planned: latest.quantitative.records.transactionPositionPlanned,
      Actual: latest.quantitative.records.transactionPositionActual,
    },
    {
      name: 'Inflight',
      Planned: latest.quantitative.records.inflightDataPlanned,
      Actual: latest.quantitative.records.inflightDataActual,
    },
  ];

  const variance = getRuntimeVariancePct(latest.quantitative.runtime);
  const varianceColor = Math.abs(variance) > 25 ? '#ef4444' : Math.abs(variance) > 10 ? '#f59e0b' : '#10b981';

  return (
    <div className="space-y-3">
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={recordsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
          <Bar dataKey="Planned" fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Actual" fill="#10b981" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/60">
        <div className="text-xs text-slate-400">Runtime</div>
        <div className="flex gap-4 text-xs">
          <span className="text-slate-300">Expected: <strong>{latest.quantitative.runtime.expectedRunbookRuntimeMinutes}m</strong></span>
          <span className="text-slate-300">Actual: <strong>{latest.quantitative.runtime.actualRunbookRuntimeMinutes}m</strong></span>
          <span style={{ color: varianceColor }}>Variance: <strong>{variance > 0 ? '+' : ''}{variance}%</strong></span>
        </div>
      </div>
    </div>
  );
};
