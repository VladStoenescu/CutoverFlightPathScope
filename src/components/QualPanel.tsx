import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import type { CutoverEvent } from '../models';

interface Props {
  events: CutoverEvent[];
}

export const QualPanel: React.FC<Props> = ({ events }) => {
  if (!events.length) return <div className="text-slate-500 text-sm">No events yet.</div>;

  const defectData = events.map((e) => ({
    name: e.name,
    Expected: e.qualitative.expectedOpenDefects,
    Actual: e.qualitative.actualOpenDefects,
  }));

  const breaksData = events.map((e) => ({
    name: e.name,
    Expected: e.qualitative.expectedReconciliationBreaks,
    Actual: e.qualitative.actualReconciliationBreaks,
  }));

  const latest = events[events.length - 1];
  const signOffPct = latest.qualitative.topicsTotalCount > 0
    ? Math.round((latest.qualitative.topicsSignedOffCount / latest.qualitative.topicsTotalCount) * 100)
    : 0;

  return (
    <div className="space-y-3">
      <div>
        <div className="text-xs text-slate-400 mb-1">Open Defects (Expected vs Actual)</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={defectData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#f1f5f9' }} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
            <Line type="monotone" dataKey="Expected" stroke="#6366f1" strokeWidth={1.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Actual" stroke="#ef4444" strokeWidth={1.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <div className="text-xs text-slate-400 mb-1">Reconciliation Breaks (Expected vs Actual)</div>
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={breaksData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#f1f5f9' }} />
            <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
            <Line type="monotone" dataKey="Expected" stroke="#6366f1" strokeWidth={1.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Actual" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/60">
        <div className="text-xs text-slate-400">Topics Sign-off</div>
        <div className="flex-1 bg-slate-700 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${signOffPct}%`, background: signOffPct >= 90 ? '#10b981' : signOffPct >= 70 ? '#f59e0b' : '#ef4444' }}
          />
        </div>
        <div className="text-xs text-slate-300 whitespace-nowrap">
          {latest.qualitative.topicsSignedOffCount}/{latest.qualitative.topicsTotalCount} ({signOffPct}%)
        </div>
      </div>
    </div>
  );
};
