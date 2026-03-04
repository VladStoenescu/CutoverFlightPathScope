import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Timeline } from '../components/Timeline';
import { ReadinessGauge } from '../components/ReadinessGauge';
import { TrajectoryChart } from '../components/TrajectoryChart';
import { ScopePanel } from '../components/ScopePanel';
import { QuantPanel } from '../components/QuantPanel';
import { QualPanel } from '../components/QualPanel';
import { NextBestActions } from '../components/NextBestActions';
import { getReadinessColorToken } from '../theme';

function readinessBadgeStyle(pct: number): React.CSSProperties {
  const color = getReadinessColorToken(pct);
  return { background: color + '22', color };
}

export const OverviewPage: React.FC = () => {
  const { state, setState, sortedEvents, currentMetrics, setEditingId, handleAddEvent, handleLoadDemo } = useApp();

  const daysUntilGoLive = useMemo(() => {
    if (!state.config.goLiveDate) return null;
    const now = new Date().setHours(0, 0, 0, 0);
    return Math.ceil((new Date(state.config.goLiveDate + 'T00:00:00').getTime() - now) / (1000 * 60 * 60 * 24));
  }, [state.config.goLiveDate]);

  const lowestScore = currentMetrics
    ? [
        { label: 'Scope', pct: currentMetrics.scopeReadinessPct },
        { label: 'Quantitative', pct: currentMetrics.quantitativeReadinessPct },
        { label: 'Qualitative', pct: currentMetrics.qualitativeReadinessPct },
      ].reduce((min, item) => item.pct < min.pct ? item : min)
    : null;

  const handleAddAnnotation = (eventId: string) => {
    const text = prompt('Enter annotation:');
    if (!text) return;
    setState(s => ({
      ...s,
      annotations: [...(s.annotations ?? []), { eventId, text, timestamp: new Date().toISOString() }],
    }));
  };

  if (state.events.length === 0) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="text-6xl">✈️</div>
        <h2 className="text-2xl font-bold text-n-900 dark:text-slate-300">Start Your Cutover Flightpath</h2>
        <p className="text-n-600 dark:text-slate-500 max-w-md mx-auto">
          Track Dress Rehearsals (DRH) and Migration Dry Runs (MDR) to reach 100% cutover readiness.
        </p>
        {/* Example KPIs */}
        <div className="flex justify-center gap-6 flex-wrap text-sm text-n-600 dark:text-slate-400 italic">
          <span>📊 Overall: <b className="text-green-600">91%</b></span>
          <span>🗂 Scope: <b className="text-yellow-500">85%</b></span>
          <span>📐 Quant: <b className="text-green-600">94%</b></span>
          <span>✅ Qual: <b className="text-green-600">90%</b></span>
          <span className="text-n-400">(demo data preview)</span>
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={() => handleLoadDemo()}
            className="bg-warning/20 hover:bg-warning/30 text-warning px-4 py-2 rounded-lg border border-warning/30 font-medium transition-colors"
          >
            🗂 Load Demo Data
          </button>
          <button
            onClick={() => handleAddEvent('DRH')}
            className="bg-p-blue hover:bg-navy text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add DRH Event
          </button>
          <button
            onClick={() => handleAddEvent('MDR')}
            className="bg-teal hover:bg-teal/80 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add MDR Event
          </button>
        </div>
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
            goLiveDate={state.config.goLiveDate}
            annotations={state.annotations ?? []}
            onAddAnnotation={handleAddAnnotation}
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
              <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-xs mb-2">
                <span className="text-warning font-semibold">🎯 Focus Area: </span>
                <span className="text-n-900 dark:text-amber-200">{lowestScore.label} ({lowestScore.pct}%) — improve this to boost overall readiness</span>
              </div>
            )}

            {currentMetrics && <NextBestActions currentMetrics={currentMetrics} />}

            {daysUntilGoLive !== null && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-n-50 dark:bg-slate-800 rounded p-2 text-center border border-n-200 dark:border-slate-700">
                  <div className="text-2xl font-bold text-n-900 dark:text-slate-200">{daysUntilGoLive}</div>
                  <div className="text-n-600 dark:text-slate-500">Days to Go-Live</div>
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
