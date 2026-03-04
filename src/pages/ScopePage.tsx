import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ScopePanel } from '../components/ScopePanel';
import { computeScopeReadiness } from '../models';

export const ScopePage: React.FC = () => {
  const { sortedEvents } = useApp();

  if (sortedEvents.length === 0) {
    return <div className="text-center py-16 text-n-600 dark:text-slate-500">No events yet. Add a DRH or MDR to get started.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-n-900 dark:text-slate-100">Scope Coverage</h1>

      <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-n-200 dark:border-slate-800">
        <div className="text-sm font-semibold text-n-600 dark:text-slate-500 uppercase tracking-wider mb-4">Latest Event — Scope Chart</div>
        <ScopePanel events={sortedEvents} />
      </div>

      <div className="bg-white dark:bg-slate-900/50 rounded-xl p-6 border border-n-200 dark:border-slate-800">
        <div className="text-sm font-semibold text-n-600 dark:text-slate-500 uppercase tracking-wider mb-4">Event-by-Event Scope Breakdown</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-n-200 dark:border-slate-700">
                <th className="text-left py-2 pr-4 text-n-600 dark:text-slate-400 font-medium">Event</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Runbook</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Migration</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Applications</th>
                <th className="text-right py-2 px-3 text-n-600 dark:text-slate-400 font-medium">Legacy ID</th>
                <th className="text-right py-2 pl-3 text-n-600 dark:text-slate-400 font-medium">Scope Readiness</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event) => {
                const readiness = computeScopeReadiness(event.scope);
                return (
                  <tr key={event.id} className="border-b border-n-200/50 dark:border-slate-800 hover:bg-n-50 dark:hover:bg-slate-800/30">
                    <td className="py-2 pr-4">
                      <span className="font-semibold text-n-900 dark:text-slate-200">{event.name}</span>
                      <span className="ml-2 text-xs text-n-600 dark:text-slate-500">{event.date}</span>
                    </td>
                    <td className="text-right py-2 px-3 text-n-900 dark:text-slate-300">
                      <span className="text-n-600 dark:text-slate-500">{event.scope.runbookScopePctPlanned}%</span>
                      {' → '}
                      <span style={{ color: event.scope.runbookScopePctActual >= event.scope.runbookScopePctPlanned ? '#16A34A' : '#DC2626' }}>
                        {event.scope.runbookScopePctActual}%
                      </span>
                    </td>
                    <td className="text-right py-2 px-3 text-n-900 dark:text-slate-300">
                      <span className="text-n-600 dark:text-slate-500">{event.scope.migrationScopePctPlanned}%</span>
                      {' → '}
                      <span style={{ color: event.scope.migrationScopePctActual >= event.scope.migrationScopePctPlanned ? '#16A34A' : '#DC2626' }}>
                        {event.scope.migrationScopePctActual}%
                      </span>
                    </td>
                    <td className="text-right py-2 px-3 text-n-900 dark:text-slate-300">
                      <span className="text-n-600 dark:text-slate-500">{event.scope.applicationsScopePctPlanned}%</span>
                      {' → '}
                      <span style={{ color: event.scope.applicationsScopePctActual >= event.scope.applicationsScopePctPlanned ? '#16A34A' : '#DC2626' }}>
                        {event.scope.applicationsScopePctActual}%
                      </span>
                    </td>
                    <td className="text-right py-2 px-3 text-n-900 dark:text-slate-300">
                      <span className="text-n-600 dark:text-slate-500">{event.scope.legacyIdConversionScopePctPlanned}%</span>
                      {' → '}
                      <span style={{ color: event.scope.legacyIdConversionScopePctActual >= event.scope.legacyIdConversionScopePctPlanned ? '#16A34A' : '#DC2626' }}>
                        {event.scope.legacyIdConversionScopePctActual}%
                      </span>
                    </td>
                    <td className="text-right py-2 pl-3">
                      <span
                        className="font-bold text-base"
                        style={{ color: readiness >= 90 ? '#16A34A' : readiness >= 70 ? '#F59E0B' : '#DC2626' }}
                      >
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
