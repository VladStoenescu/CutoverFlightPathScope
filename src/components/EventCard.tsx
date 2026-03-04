import React from 'react';
import { computeDerivedMetrics, getReadinessColor, getRuntimeVariancePct } from '../models';
import type { CutoverEvent } from '../models';

interface Props {
  event: CutoverEvent;
  onEdit: (id: string) => void;
  isLatest?: boolean;
}

export const EventCard: React.FC<Props> = ({ event, onEdit, isLatest }) => {
  const metrics = computeDerivedMetrics(event);
  const color = getReadinessColor(metrics.overallReadinessPct);
  const variance = getRuntimeVariancePct(event.quantitative.runtime);
  const varianceColor = Math.abs(variance) > 25 ? '#ef4444' : Math.abs(variance) > 10 ? '#f59e0b' : '#10b981';
  const signOffPct = event.qualitative.topicsTotalCount > 0
    ? Math.round((event.qualitative.topicsSignedOffCount / event.qualitative.topicsTotalCount) * 100)
    : 0;

  const recordsTotal = event.quantitative.records.referenceDataPlanned + event.quantitative.records.staticDataPlanned +
    event.quantitative.records.transactionPositionPlanned + event.quantitative.records.inflightDataPlanned;
  const recordsActual = event.quantitative.records.referenceDataActual + event.quantitative.records.staticDataActual +
    event.quantitative.records.transactionPositionActual + event.quantitative.records.inflightDataActual;
  const recordsPct = recordsTotal > 0 ? Math.round((recordsActual / recordsTotal) * 100) : 0;

  const typeColor = event.type === 'DRH' ? '#6366f1' : '#06b6d4';

  return (
    <div
      className={`relative bg-slate-800 rounded-xl p-4 border transition-all cursor-pointer hover:border-slate-500 ${isLatest ? 'border-indigo-500/60 shadow-lg shadow-indigo-500/10' : 'border-slate-700'}`}
      onClick={() => onEdit(event.id)}
      style={{ minWidth: 200 }}
    >
      {isLatest && (
        <div className="absolute -top-2 left-3 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">Latest</div>
      )}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: typeColor + '22', color: typeColor, border: `1px solid ${typeColor}44` }}
          >
            {event.type}
          </span>
          <span className="font-semibold text-slate-100">{event.name}</span>
        </div>
        <span className="text-lg font-bold" style={{ color }}>{metrics.overallReadinessPct}%</span>
      </div>
      {event.date && (
        <div className="text-xs text-slate-500 mb-2">{new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      )}
      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="bg-slate-900/50 rounded p-1.5">
          <div className="text-slate-500">Scope</div>
          <div className="font-semibold text-slate-200">{metrics.scopeReadinessPct}%</div>
        </div>
        <div className="bg-slate-900/50 rounded p-1.5">
          <div className="text-slate-500">Records</div>
          <div className="font-semibold text-slate-200">{recordsPct}%</div>
        </div>
        <div className="bg-slate-900/50 rounded p-1.5">
          <div className="text-slate-500">Runtime</div>
          <div className="font-semibold" style={{ color: varianceColor }}>{variance > 0 ? '+' : ''}{variance}%</div>
        </div>
        <div className="bg-slate-900/50 rounded p-1.5">
          <div className="text-slate-500">Sign-off</div>
          <div className="font-semibold text-slate-200">{signOffPct}%</div>
        </div>
      </div>
      <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${metrics.overallReadinessPct}%`, background: color }} />
      </div>
      <div className="mt-1.5 text-xs text-center" style={{ color: '#64748b' }}>click to edit</div>
    </div>
  );
};
