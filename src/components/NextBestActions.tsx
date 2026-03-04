import React from 'react';
import type { DerivedMetrics } from '../models';

const ACTIONS: Record<string, string[]> = {
  Scope: [
    'Schedule a focused runbook walkthrough to close scope gaps',
    'Identify unmigrated application components and assign owners',
    'Run legacy ID conversion dry-run on remaining records',
  ],
  Quantitative: [
    'Investigate records categories with < 90% actual vs planned',
    'Review runbook timing — identify steps causing runtime overrun',
    'Benchmark inflight data pipeline throughput and optimise',
  ],
  Qualitative: [
    'Triage open defects and close or defer all sev-1/sev-2 issues',
    'Hold reconciliation break review meeting with data teams',
    'Accelerate pending topic sign-offs — target all by next rehearsal',
  ],
};

interface Props {
  currentMetrics: DerivedMetrics;
}

export const NextBestActions: React.FC<Props> = ({ currentMetrics }) => {
  const ranked = [
    { label: 'Scope', pct: currentMetrics.scopeReadinessPct },
    { label: 'Quantitative', pct: currentMetrics.quantitativeReadinessPct },
    { label: 'Qualitative', pct: currentMetrics.qualitativeReadinessPct },
  ].sort((a, b) => a.pct - b.pct);

  const worst = ranked[0];
  const actions = ACTIONS[worst.label];

  return (
    <div className="mt-2 bg-blue-50 dark:bg-slate-800/60 border border-blue-200 dark:border-slate-700 rounded-lg p-3 text-xs">
      <div className="font-semibold text-blue-700 dark:text-indigo-300 mb-2">⚡ Next Best Actions ({worst.label} at {worst.pct}%)</div>
      <ol className="space-y-1 list-decimal list-inside text-n-700 dark:text-slate-300">
        {actions.map((a, i) => <li key={i}>{a}</li>)}
      </ol>
    </div>
  );
};
