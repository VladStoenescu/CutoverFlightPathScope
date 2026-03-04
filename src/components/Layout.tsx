import React, { useRef } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { EventDrawer } from './EventDrawer';
import { exportPptx } from '../export/pptxExport';

export const Layout: React.FC = () => {
  const {
    state, setState, editingId, setEditingId,
    currentMetrics, eventsRemaining,
    handleAddEvent, handleSaveEvent, handleDeleteEvent,
    handleReset, handleLoadDemo, handleExport, handleImport,
    sortedEvents,
  } = useApp();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editingEvent = editingId ? state.events.find((e) => e.id === editingId) ?? null : null;

  const daysUntilCutover = state.config.cutoverDate
    ? Math.ceil((new Date(state.config.cutoverDate + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const [editingName, setEditingName] = React.useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-p-blue text-white dark:bg-indigo-600'
        : 'text-n-600 hover:text-n-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-n-200 dark:hover:bg-slate-700'
    }`;

  return (
    <div className="min-h-screen bg-n-50 dark:bg-slate-950 text-n-900 dark:text-slate-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-n-200 dark:border-slate-800 px-4 py-2 backdrop-blur">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          {/* Left: program info */}
          <div className="flex items-center gap-3 min-w-0">
            <div>
              {editingName ? (
                <input
                  autoFocus
                  value={state.config.programName}
                  onChange={(e) => setState({ ...state, config: { ...state.config, programName: e.target.value } })}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setEditingName(false); }}
                  className="bg-n-200 dark:bg-slate-800 border border-p-blue rounded px-2 py-1 text-base font-bold text-n-900 dark:text-slate-100 focus:outline-none"
                />
              ) : (
                <h1
                  className="text-base font-bold cursor-pointer hover:text-p-blue dark:hover:text-indigo-300 transition-colors whitespace-nowrap"
                  onClick={() => setEditingName(true)}
                  title="Click to rename"
                >
                  ✈️ {state.config.programName}
                </h1>
              )}
              <div className="flex items-center gap-2 text-xs text-n-600 dark:text-slate-500 flex-wrap">
                <span>Go-Live:</span>
                <input
                  type="date"
                  value={state.config.cutoverDate}
                  onChange={(e) => setState({ ...state, config: { ...state.config, cutoverDate: e.target.value } })}
                  className="bg-transparent border-none text-n-600 dark:text-slate-400 focus:outline-none text-xs"
                />
                {daysUntilCutover !== null && (
                  <span className={daysUntilCutover < 30 ? 'text-danger' : daysUntilCutover < 60 ? 'text-warning' : 'text-n-600 dark:text-slate-400'}>
                    ({daysUntilCutover}d)
                  </span>
                )}
                <span className="text-gold font-semibold">
                  {eventsRemaining} events until go-live
                </span>
              </div>
            </div>
          </div>

          {/* Center: Nav */}
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>Overview</NavLink>
            <NavLink to="/scope" className={navLinkClass}>Scope</NavLink>
            <NavLink to="/quant" className={navLinkClass}>Quantitative</NavLink>
            <NavLink to="/qual" className={navLinkClass}>Qualitative</NavLink>
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {currentMetrics && (
              <div className="text-center mr-2">
                <div
                  className="text-xl font-black"
                  style={{ color: currentMetrics.overallReadinessPct >= 90 ? '#16A34A' : currentMetrics.overallReadinessPct >= 70 ? '#F59E0B' : '#DC2626' }}
                >
                  {currentMetrics.overallReadinessPct}%
                </div>
                <div className="text-xs text-n-600 dark:text-slate-500">Readiness</div>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="bg-n-200 hover:bg-n-200/80 dark:bg-slate-700 dark:hover:bg-slate-600 text-n-900 dark:text-slate-200 text-sm px-2 py-1.5 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => handleAddEvent('DRH')}
              className="bg-p-blue hover:bg-navy dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              + DRH
            </button>
            <button
              onClick={() => handleAddEvent('MDR')}
              className="bg-teal hover:bg-teal/80 text-white text-sm px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              + MDR
            </button>
            <div className="w-px h-5 bg-n-200 dark:bg-slate-700" />
            <button
              onClick={handleExport}
              className="bg-n-200 hover:bg-n-200/80 dark:bg-slate-700 dark:hover:bg-slate-600 text-n-900 dark:text-slate-200 text-sm px-2 py-1.5 rounded-lg transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-n-200 hover:bg-n-200/80 dark:bg-slate-700 dark:hover:bg-slate-600 text-n-900 dark:text-slate-200 text-sm px-2 py-1.5 rounded-lg transition-colors"
            >
              Import JSON
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button
              onClick={() => exportPptx(state, sortedEvents)}
              className="bg-gold hover:bg-gold/80 text-white text-sm px-2 py-1.5 rounded-lg transition-colors font-medium"
            >
              Export PPTX
            </button>
            <div className="w-px h-5 bg-n-200 dark:bg-slate-700" />
            <button
              onClick={handleLoadDemo}
              className="bg-warning/20 hover:bg-warning/30 text-warning text-sm px-2 py-1.5 rounded-lg transition-colors border border-warning/30"
            >
              Demo
            </button>
            <button
              onClick={handleReset}
              className="bg-danger/10 hover:bg-danger/20 text-danger text-sm px-2 py-1.5 rounded-lg transition-colors border border-danger/20"
            >
              Reset
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6">
        <Outlet />
      </main>

      <EventDrawer
        event={editingEvent}
        onSave={handleSaveEvent}
        onClose={() => setEditingId(null)}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};
