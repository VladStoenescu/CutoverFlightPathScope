import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Timeline } from '../components/Timeline';
import { ReadinessGauge } from '../components/ReadinessGauge';
import { TrajectoryChart } from '../components/TrajectoryChart';
import { ScopePanel } from '../components/ScopePanel';
import { QuantPanel } from '../components/QuantPanel';
import { QualPanel } from '../components/QualPanel';
import { getReadinessColorToken } from '../theme';

function readinessBadgeStyle(pct: number): React.CSSProperties {
  const color = getReadinessColorToken(pct);
  return { background: color + '22', color };
}

export const OverviewPage: React.FC = () => {
  const { state, setState, sortedEvents, currentMetrics, setEditingId } = useApp();

  const daysUntilCutover = state.config.cutoverDate
    ? Math.ceil((new Date(state.config.cutoverDate + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const lowestScore = currentMetrics
    ? [
        { label: 'Scope', pct: currentMetrics.scopeReadinessPct },
        { label: 'Quantitative', pct: currentMetrics.quantitativeReadinessPct },
        { label: 'Qualitative', pct: currentMetrics.qualitativeReadinessPct },
      ].reduce((min, item) => item.pct < min.pct ? item : min)
    : null;

  if (state.events.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="text-6xl">✈️</div>
        <h2 className="text-2xl font-bold text-n-900 dark:text-slate-300">Start Your Cutover Flightpath</h2>
        <p className="text-n-600 dark:text-slate-500 max-w-md mx-auto">
          Add Dress Rehearsals (DRH) and Migration Dry Runs (MDR) to track your progress toward 100% cutover readiness.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <section>
        <h2 className="text-sm font-semibold text-n-600 dark:text-slate-500 uppercase tracking-wider mb-3">Flightpath Timeline</h2>
        <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
          <Timeline
            events={sortedEvents}
            onEdit={setEditingId}
            cutoverDate={state.config.cutoverDate}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Path to 100% */}
        <section className="xl:col-span-1 space-y-4">
          <h2 className="text-sm font-semibold text-n-600 dark:text-slate-500 uppercase tracking-wider">Path to 100%</h2>

          <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
            <div className="flex justify-around items-center mb-4 flex-wrap gap-2">
              {currentMetrics && (
                <>
                  <ReadinessGauge pct={currentMetrics.overallReadinessPct} size={100} label="Overall" />
                  <ReadinessGauge pct={currentMetrics.scopeReadinessPct} size={80} label="Scope" />
                  <ReadinessGauge pct={currentMetrics.quantitativeReadinessPct} size={80} label="Quant" />
                  <ReadinessGauge pct={currentMetrics.qualitativeReadinessPct} size={80} label="Qual" />
                </>
              )}
            </div>

            {lowestScore && (
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-xs">
                <span className="text-warning font-semibold">🎯 Focus Area: </span>
                <span className="text-n-900 dark:text-amber-200">{lowestScore.label} ({lowestScore.pct}%) — improve this to boost overall readiness</span>
              </div>
            )}

            {daysUntilCutover !== null && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-n-50 dark:bg-slate-800 rounded p-2 text-center border border-n-200 dark:border-slate-700">
                  <div className="text-2xl font-bold text-n-900 dark:text-slate-200">{daysUntilCutover}</div>
                  <div className="text-n-600 dark:text-slate-500">Days to Cutover</div>
                </div>
                <div className="bg-n-50 dark:bg-slate-800 rounded p-2 text-center border border-n-200 dark:border-slate-700">
                  <div className="text-2xl font-bold text-n-900 dark:text-slate-200">{currentMetrics ? 100 - currentMetrics.overallReadinessPct : '—'}</div>
                  <div className="text-n-600 dark:text-slate-500">% Gap to Close</div>
                </div>
              </div>
            )}

            {/* Go-live window inputs */}
            <div className="mt-3 pt-3 border-t border-n-200 dark:border-slate-700">
              <div className="text-xs text-n-600 dark:text-slate-500 mb-2 font-semibold">Go-Live Window</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-n-600 dark:text-slate-500 block mb-1">Start</label>
                  <input
                    type="date"
                    value={state.config.goLiveWindowStart ?? ''}
                    onChange={(e) => setState({ ...state, config: { ...state.config, goLiveWindowStart: e.target.value } })}
                    className="w-full bg-n-50 dark:bg-slate-800 border border-n-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-p-blue"
                  />
                </div>
                <div>
                  <label className="text-n-600 dark:text-slate-500 block mb-1">End</label>
                  <input
                    type="date"
                    value={state.config.goLiveWindowEnd ?? ''}
                    onChange={(e) => setState({ ...state, config: { ...state.config, goLiveWindowEnd: e.target.value } })}
                    className="w-full bg-n-50 dark:bg-slate-800 border border-n-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-p-blue"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
            <div className="text-xs font-semibold text-n-600 dark:text-slate-500 uppercase tracking-wider mb-3">Readiness Trajectory</div>
            <TrajectoryChart events={sortedEvents} goLiveWindowStart={state.config.goLiveWindowStart} goLiveWindowEnd={state.config.goLiveWindowEnd} />
          </div>
        </section>

        {/* Story Panels */}
        <section className="xl:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-n-600 dark:text-slate-500 uppercase tracking-wider">Readiness Story Panels</h2>

          <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-n-900 dark:text-slate-300">A · Scope Coverage</div>
              {currentMetrics && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={readinessBadgeStyle(currentMetrics.scopeReadinessPct)}>
                  {currentMetrics.scopeReadinessPct}% readiness
                </span>
              )}
            </div>
            <ScopePanel events={sortedEvents} />
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-n-900 dark:text-slate-300">B · Quantitative</div>
              {currentMetrics && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={readinessBadgeStyle(currentMetrics.quantitativeReadinessPct)}>
                  {currentMetrics.quantitativeReadinessPct}% readiness
                </span>
              )}
            </div>
            <QuantPanel events={sortedEvents} />
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-n-900 dark:text-slate-300">C · Qualitative</div>
              {currentMetrics && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={readinessBadgeStyle(currentMetrics.qualitativeReadinessPct)}>
                  {currentMetrics.qualitativeReadinessPct}% readiness
                </span>
              )}
            </div>
            <QualPanel events={sortedEvents} />
          </div>
        </section>
      </div>
    </div>
  );
};
