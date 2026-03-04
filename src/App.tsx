import React, { useState, useEffect, useRef } from 'react';
import { Timeline } from './components/Timeline';
import { EventDrawer } from './components/EventDrawer';
import { ScopePanel } from './components/ScopePanel';
import { QuantPanel } from './components/QuantPanel';
import { QualPanel } from './components/QualPanel';
import { ReadinessGauge } from './components/ReadinessGauge';
import { TrajectoryChart } from './components/TrajectoryChart';
import { loadState, saveState, clearState, exportJSON, importJSON } from './storage';
import { demoData } from './demoData';
import { createEvent, computeDerivedMetrics } from './models';
import type { AppState, CutoverEvent } from './models';

const DEFAULT_STATE: AppState = {
  config: {
    programName: 'My Migration Program',
    cutoverDate: '',
    readinessTarget: 100,
  },
  events: [],
};

function App() {
  const [state, setState] = useState<AppState>(() => loadState() ?? DEFAULT_STATE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const editingEvent = editingId ? state.events.find((e) => e.id === editingId) ?? null : null;

  const sortedEvents = [...state.events].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  const latestEvent = sortedEvents[sortedEvents.length - 1];
  const currentMetrics = latestEvent ? computeDerivedMetrics(latestEvent) : null;

  const nextSeqNum = (type: 'DRH' | 'MDR') => {
    const ofType = state.events.filter((e) => e.type === type);
    return ofType.length + 1;
  };

  const handleAddEvent = (type: 'DRH' | 'MDR') => {
    const event = createEvent(type, state.events.length + 1);
    event.name = `${type}-${nextSeqNum(type)}`;
    const newState = { ...state, events: [...state.events, event] };
    setState(newState);
    setEditingId(event.id);
  };

  const handleSaveEvent = (event: CutoverEvent) => {
    setState({ ...state, events: state.events.map((e) => (e.id === event.id ? event : e)) });
    setEditingId(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (!confirm('Delete this event?')) return;
    setState({ ...state, events: state.events.filter((e) => e.id !== id) });
    setEditingId(null);
  };

  const handleReset = () => {
    if (!confirm('Reset all data? This cannot be undone.')) return;
    clearState();
    setState(DEFAULT_STATE);
  };

  const handleLoadDemo = () => {
    if (!confirm('Load demo data? This will replace current data.')) return;
    setState(demoData);
  };

  const handleExport = () => exportJSON(state);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importJSON(file);
      setState(imported);
    } catch {
      alert('Failed to import JSON. Please check the file format.');
    }
    e.target.value = '';
  };

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-6 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              {editingName ? (
                <input
                  autoFocus
                  value={state.config.programName}
                  onChange={(e) => setState({ ...state, config: { ...state.config, programName: e.target.value } })}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setEditingName(false); }}
                  className="bg-slate-800 border border-indigo-500 rounded px-2 py-1 text-lg font-bold text-slate-100 focus:outline-none"
                />
              ) : (
                <h1
                  className="text-lg font-bold text-slate-100 cursor-pointer hover:text-indigo-300 transition-colors"
                  onClick={() => setEditingName(true)}
                  title="Click to rename"
                >
                  ✈️ {state.config.programName}
                </h1>
              )}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Cutover:</span>
                <input
                  type="date"
                  value={state.config.cutoverDate}
                  onChange={(e) => setState({ ...state, config: { ...state.config, cutoverDate: e.target.value } })}
                  className="bg-transparent border-none text-slate-400 focus:outline-none text-xs"
                />
                {daysUntilCutover !== null && (
                  <span className={daysUntilCutover < 30 ? 'text-red-400' : daysUntilCutover < 60 ? 'text-yellow-400' : 'text-slate-400'}>
                    ({daysUntilCutover} days)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {currentMetrics && (
              <div className="text-center">
                <div
                  className="text-3xl font-black"
                  style={{ color: currentMetrics.overallReadinessPct >= 90 ? '#10b981' : currentMetrics.overallReadinessPct >= 70 ? '#f59e0b' : '#ef4444' }}
                >
                  {currentMetrics.overallReadinessPct}%
                </div>
                <div className="text-xs text-slate-500">Current Readiness</div>
              </div>
            )}
            <div className="text-center text-xs text-slate-500">
              <div className="text-slate-300 font-medium">{state.events.length} events</div>
              <div>{state.events.filter(e => e.type === 'DRH').length} DRH · {state.events.filter(e => e.type === 'MDR').length} MDR</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => handleAddEvent('DRH')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              + DRH
            </button>
            <button
              onClick={() => handleAddEvent('MDR')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              + MDR
            </button>
            <div className="w-px h-6 bg-slate-700" />
            <button
              onClick={handleExport}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm px-3 py-1.5 rounded-lg transition-colors"
            >
              Import JSON
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <div className="w-px h-6 bg-slate-700" />
            <button
              onClick={handleLoadDemo}
              className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 text-sm px-3 py-1.5 rounded-lg transition-colors border border-amber-700/50"
            >
              Demo Data
            </button>
            <button
              onClick={handleReset}
              className="bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm px-3 py-1.5 rounded-lg transition-colors border border-red-800/50"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        {/* Empty state */}
        {state.events.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">✈️</div>
            <h2 className="text-2xl font-bold text-slate-300">Start Your Cutover Flightpath</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Add Dress Rehearsals (DRH) and Migration Dry Runs (MDR) to track your progress toward 100% cutover readiness.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => handleAddEvent('DRH')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                Add First DRH
              </button>
              <button onClick={() => handleAddEvent('MDR')} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                Add First MDR
              </button>
              <button onClick={handleLoadDemo} className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 px-6 py-2.5 rounded-lg font-medium transition-colors border border-amber-700/50">
                Load Demo Data
              </button>
            </div>
          </div>
        )}

        {state.events.length > 0 && (
          <>
            {/* Timeline */}
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Flightpath Timeline</h2>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                <Timeline
                  events={sortedEvents}
                  onEdit={setEditingId}
                  cutoverDate={state.config.cutoverDate}
                />
              </div>
            </section>

            {/* Path to 100% + Story Panels */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Path to 100% */}
              <section className="xl:col-span-1 space-y-4">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Path to 100%</h2>
                
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex justify-around items-center mb-4">
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
                    <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 text-xs">
                      <span className="text-amber-300 font-semibold">🎯 Focus Area: </span>
                      <span className="text-amber-200">{lowestScore.label} ({lowestScore.pct}%) — improve this to boost overall readiness</span>
                    </div>
                  )}

                  {daysUntilCutover !== null && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-800 rounded p-2 text-center">
                        <div className="text-2xl font-bold text-slate-200">{daysUntilCutover}</div>
                        <div className="text-slate-500">Days to Cutover</div>
                      </div>
                      <div className="bg-slate-800 rounded p-2 text-center">
                        <div className="text-2xl font-bold text-slate-200">{currentMetrics ? 100 - currentMetrics.overallReadinessPct : '—'}</div>
                        <div className="text-slate-500">% Gap to Close</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Readiness Trajectory</div>
                  <TrajectoryChart events={sortedEvents} />
                </div>
              </section>

              {/* Story Panels */}
              <section className="xl:col-span-2 space-y-4">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Readiness Story Panels</h2>
                
                {/* Scope Panel */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-slate-300">A · Scope Coverage (Latest Event)</div>
                    {currentMetrics && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        background: currentMetrics.scopeReadinessPct >= 90 ? '#10b98122' : currentMetrics.scopeReadinessPct >= 70 ? '#f59e0b22' : '#ef444422',
                        color: currentMetrics.scopeReadinessPct >= 90 ? '#10b981' : currentMetrics.scopeReadinessPct >= 70 ? '#f59e0b' : '#ef4444',
                      }}>
                        {currentMetrics.scopeReadinessPct}% readiness
                      </span>
                    )}
                  </div>
                  <ScopePanel events={sortedEvents} />
                </div>

                {/* Quantitative Panel */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-slate-300">B · Quantitative (Latest Event)</div>
                    {currentMetrics && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        background: currentMetrics.quantitativeReadinessPct >= 90 ? '#10b98122' : currentMetrics.quantitativeReadinessPct >= 70 ? '#f59e0b22' : '#ef444422',
                        color: currentMetrics.quantitativeReadinessPct >= 90 ? '#10b981' : currentMetrics.quantitativeReadinessPct >= 70 ? '#f59e0b' : '#ef4444',
                      }}>
                        {currentMetrics.quantitativeReadinessPct}% readiness
                      </span>
                    )}
                  </div>
                  <QuantPanel events={sortedEvents} />
                </div>

                {/* Qualitative Panel */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-slate-300">C · Qualitative (Trend across Events)</div>
                    {currentMetrics && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{
                        background: currentMetrics.qualitativeReadinessPct >= 90 ? '#10b98122' : currentMetrics.qualitativeReadinessPct >= 70 ? '#f59e0b22' : '#ef444422',
                        color: currentMetrics.qualitativeReadinessPct >= 90 ? '#10b981' : currentMetrics.qualitativeReadinessPct >= 70 ? '#f59e0b' : '#ef4444',
                      }}>
                        {currentMetrics.qualitativeReadinessPct}% readiness
                      </span>
                    )}
                  </div>
                  <QualPanel events={sortedEvents} />
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      {/* Event Drawer */}
      <EventDrawer
        event={editingEvent}
        onSave={handleSaveEvent}
        onClose={() => setEditingId(null)}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}

export default App;
