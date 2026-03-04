import React from 'react';
import { useApp } from '../contexts/AppContext';
import { QuantPanel } from '../components/QuantPanel';
import { computeQuantitativeReadiness, getRuntimeVariancePct } from '../models';
import { colors, getReadinessColorToken } from '../theme';

export const QuantPage: React.FC = () => {
  const { sortedEvents } = useApp();

  if (sortedEvents.length === 0) {
    return <div className="text-center py-16 text-n-600 dark:text-slate-500">No events yet. Add a DRH or MDR to get started.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-n-900 dark:text-slate-100">Quantitative Readiness</h1>

      <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-n-200 dark:border-slate-800">
        <div className="text-sm font-semibold text-n-600 dark:text-slate-500 uppercase tracking-wider mb-4">Latest Event — Records Chart</div>
        <QuantPanel events={sortedEvents} />
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-n-200 dark:border-slate-800">
        <div className="text-sm font-semibold text-n-600 dark:text-slate-500 uppercase tracking-wider mb-4">Event-by-Event Quantitative Summary</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-n-200 dark:border-slate-700">
                <th className="text-left py-2 pr-4 text-n-600 dark:text-slate-400 font-medium">Event</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Ref Data</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Static</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Txn+Pos</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Inflight</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Runtime Var</th>
                <th className="text-right py-2 pl-3 text-n-600 dark:text-slate-400 font-medium">Quant Readiness</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event) => {
                const readiness = computeQuantitativeReadiness(event.quantitative);
                const variance = getRuntimeVariancePct(event.quantitative.runtime);
                const varColor = Math.abs(variance) > 25 ? colors.danger : Math.abs(variance) > 10 ? colors.warning : colors.success;
                const r = event.quantitative.records;
                const refPct = r.referenceDataPlanned > 0 ? Math.round((r.referenceDataActual / r.referenceDataPlanned) * 100) : 0;
                const statPct = r.staticDataPlanned > 0 ? Math.round((r.staticDataActual / r.staticDataPlanned) * 100) : 0;
                const txnPct = r.transactionPositionPlanned > 0 ? Math.round((r.transactionPositionActual / r.transactionPositionPlanned) * 100) : 0;
                const infPct = r.inflightDataPlanned > 0 ? Math.round((r.inflightDataActual / r.inflightDataPlanned) * 100) : 0;
                return (
                  <tr key={event.id} className="border-b border-n-200/50 dark:border-slate-800 hover:bg-n-50 dark:hover:bg-slate-800/30">
                    <td className="py-2 pr-4">
                      <span className="font-semibold text-n-900 dark:text-slate-200">{event.name}</span>
                    </td>
                    <td className="text-right py-2 px-3 text-n-900 dark:text-slate-300">{refPct}%</td>
                    <td className="text-right py-2 px-3 text-n-900 dark:text-slate-300">{statPct}%</td>
                    <td className="text-right py-2 px-3 text-n-900 dark:text-slate-300">{txnPct}%</td>
                    <td className="text-right py-2 px-3 text-n-900 dark:text-slate-300">{infPct}%</td>
                    <td className="text-right py-2 px-3 font-medium" style={{ color: varColor }}>{variance > 0 ? '+' : ''}{variance}%</td>
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
