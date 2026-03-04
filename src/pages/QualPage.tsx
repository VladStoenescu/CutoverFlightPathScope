import React from 'react';
import { useApp } from '../contexts/AppContext';
import { QualPanel } from '../components/QualPanel';
import { computeQualitativeReadiness } from '../models';
import { colors, getReadinessColorToken } from '../theme';

export const QualPage: React.FC = () => {
  const { sortedEvents } = useApp();

  if (sortedEvents.length === 0) {
    return <div className="text-center py-16 text-n-600 dark:text-slate-500">No events yet. Add a DRH or MDR to get started.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-n-900 dark:text-slate-100">Qualitative Readiness</h1>

      <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-n-200 dark:border-slate-800">
        <div className="text-sm font-semibold text-n-600 dark:text-slate-500 uppercase tracking-wider mb-4">Trend across Events</div>
        <QualPanel events={sortedEvents} />
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-n-200 dark:border-slate-800">
        <div className="text-sm font-semibold text-n-600 dark:text-slate-500 uppercase tracking-wider mb-4">Event-by-Event Quality Summary</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-n-200 dark:border-slate-700">
                <th className="text-left py-2 pr-4 text-n-600 dark:text-slate-400 font-medium">Event</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Open Defects</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Recon Breaks</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Sign-off</th>
                <th className="text-right py-2 pl-3 text-n-600 dark:text-slate-400 font-medium">Qual Readiness</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event) => {
                const readiness = computeQualitativeReadiness(event.qualitative);
                const q = event.qualitative;
                const signOffPct = q.topicsTotalCount > 0 ? Math.round((q.topicsSignedOffCount / q.topicsTotalCount) * 100) : 0;
                const defectColor = q.actualOpenDefects <= q.expectedOpenDefects ? colors.success : colors.danger;
                const breakColor = q.actualReconciliationBreaks <= q.expectedReconciliationBreaks ? colors.success : colors.danger;
                return (
                  <tr key={event.id} className="border-b border-n-200/50 dark:border-slate-800 hover:bg-n-50 dark:hover:bg-slate-800/30">
                    <td className="py-2 pr-4">
                      <span className="font-semibold text-n-900 dark:text-slate-200">{event.name}</span>
                    </td>
                    <td className="text-right py-2 px-3">
                      <span className="text-n-600 dark:text-slate-500">{q.expectedOpenDefects}</span>
                      {' → '}
                      <span style={{ color: defectColor }}>{q.actualOpenDefects}</span>
                    </td>
                    <td className="text-right py-2 px-3">
                      <span className="text-n-600 dark:text-slate-500">{q.expectedReconciliationBreaks}</span>
                      {' → '}
                      <span style={{ color: breakColor }}>{q.actualReconciliationBreaks}</span>
                    </td>
                    <td className="text-right py-2 px-3 text-n-900 dark:text-slate-300">
                      {q.topicsSignedOffCount}/{q.topicsTotalCount} ({signOffPct}%)
                    </td>
                    <td className="text-right py-2 pl-3">
                      <span className="font-bold text-base" style={{ color: getReadinessColorToken(readiness) }}>
                        {readiness}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
