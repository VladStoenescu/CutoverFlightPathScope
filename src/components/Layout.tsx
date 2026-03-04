import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { EventDrawer } from './EventDrawer';
import { CommandPalette } from './CommandPalette';
import { exportPptx } from '../export/pptxExport';

export const Layout: React.FC = () => {
  const {
    state, setState, editingId, setEditingId,
    currentMetrics, eventsRemaining,
    handleAddEvent, handleSaveEvent, handleDeleteEvent,
    handleReset, handleLoadDemo, handleExport, handleImport,
    sortedEvents, exportMode, setExportMode,
  } = useApp();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const editingEvent = editingId ? state.events.find((e) => e.id === editingId) ?? null : null;

  const daysUntilGoLive = useMemo(() => {
    if (!state.config.goLiveDate) return null;
    const now = new Date().setHours(0, 0, 0, 0);
    return Math.ceil((new Date(state.config.goLiveDate + 'T00:00:00').getTime() - now) / (1000 * 60 * 60 * 24));
  }, [state.config.goLiveDate]);

  const formattedGoLiveDate = useMemo(() => {
    if (!state.config.goLiveDate) return '';
    return new Date(state.config.goLiveDate + 'T00:00:00').toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }, [state.config.goLiveDate]);

  const formattedWindow = useMemo(() => {
    const { goLiveWindowStart, goLiveWindowEnd } = state.config;
    if (!goLiveWindowStart || !goLiveWindowEnd) return null;
    const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    return `${fmt(goLiveWindowStart)} – ${fmt(goLiveWindowEnd)}`;
  }, [state.config.goLiveWindowStart, state.config.goLiveWindowEnd]); // specific deps are correct

  const [editingName, setEditingName] = useState(false);

  // Compact mode
  const compact = state.compactMode ?? false;
  const px = compact ? 'py-1' : 'py-2';
  const mainPad = compact ? 'px-4 py-2' : 'px-6 py-6';

  // Ctrl+K listener
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setPaletteOpen(p => !p);
    }
  }, []);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleExportPptx = async () => {
    setExportMode(true);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    await exportPptx(state, sortedEvents, true);
    setExportMode(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-p-blue text-white dark:bg-indigo-600'
        : 'text-n-600 hover:text-n-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-n-200 dark:hover:bg-slate-700'
    }`;

  return (
    <div className={`min-h-screen bg-n-50 dark:bg-slate-950 text-n-900 dark:text-slate-100${exportMode ? ' pointer-events-none' : ''}`}>
      {/* Sticky Header */}
      <header className={`sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-n-200 dark:border-slate-800 px-4 ${px} backdrop-blur`}>
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
                {formattedGoLiveDate ? (
                  <span className="font-medium">Go-Live: {formattedGoLiveDate}</span>
                ) : (
                  <span>Go-Live:</span>
                )}
                <input
                  type="date"
                  value={state.config.goLiveDate}
                  onChange={(e) => setState({ ...state, config: { ...state.config, goLiveDate: e.target.value } })}
                  className="bg-transparent border-none text-n-600 dark:text-slate-400 focus:outline-none text-xs"
                />
                {daysUntilGoLive !== null && (
                  <span className={daysUntilGoLive < 30 ? 'text-danger' : daysUntilGoLive < 60 ? 'text-warning' : 'text-n-600 dark:text-slate-400'}>
                    ({daysUntilGoLive}d)
                  </span>
                )}
                {formattedWindow && (
                  <span className="text-n-500 dark:text-slate-500">Window: {formattedWindow}</span>
                )}
                <span className="text-gold font-semibold">
                  {eventsRemaining} remaining events
                </span>
              </div>
            </div>
          </div>

          {/* Center: Nav */}
          <nav className="flex items-center gap-1 flex-wrap">
            <NavLink to="/" end className={navLinkClass}>Overview</NavLink>
            <NavLink to="/scope" className={navLinkClass}>Scope</NavLink>
            <NavLink to="/quant" className={navLinkClass}>Quantitative</NavLink>
            <NavLink to="/qual" className={navLinkClass}>Qualitative</NavLink>
            <NavLink to="/insights" className={navLinkClass}>Insights</NavLink>
            <NavLink to="/signoff" className={navLinkClass}>Sign-off</NavLink>
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

            {/* Role toggle */}
            <button
              onClick={() => setState(s => ({ ...s, role: s.role === 'executive' ? 'working' : 'executive' }))}
              className="bg-n-200 hover:bg-n-200/80 dark:bg-slate-700 dark:hover:bg-slate-600 text-n-900 dark:text-slate-200 text-xs px-2 py-1.5 rounded-lg transition-colors"
              title={`Switch to ${state.role === 'executive' ? 'working' : 'executive'} view`}
            >
              {state.role === 'executive' ? '👔 Exec' : '🔧 Working'}
            </button>

            {/* Compact mode */}
            <button
              onClick={() => setState(s => ({ ...s, compactMode: !s.compactMode }))}
              className={`text-xs px-2 py-1.5 rounded-lg transition-colors ${compact ? 'bg-p-blue/20 text-p-blue dark:text-indigo-300' : 'bg-n-200 dark:bg-slate-700 text-n-900 dark:text-slate-200'}`}
              title="Toggle compact mode"
            >
              🗜️
            </button>

            <button
              onClick={toggleTheme}
              className="bg-n-200 hover:bg-n-200/80 dark:bg-slate-700 dark:hover:bg-slate-600 text-n-900 dark:text-slate-200 text-sm px-2 py-1.5 rounded-lg transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Ctrl+K palette button */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="bg-n-200 hover:bg-n-200/80 dark:bg-slate-700 dark:hover:bg-slate-600 text-n-900 dark:text-slate-200 text-xs px-2 py-1.5 rounded-lg transition-colors"
              title="Command palette (Ctrl+K)"
            >
              ⌘K
            </button>

            {state.role === 'working' && (
              <>
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
              </>
            )}

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
              onClick={handleExportPptx}
              className="bg-gold hover:bg-gold/80 text-white text-sm px-2 py-1.5 rounded-lg transition-colors font-medium"
              disabled={exportMode}
            >
              {exportMode ? '⏳' : 'Export PPTX'}
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

      <main className={`max-w-screen-2xl mx-auto ${mainPad}`}>
        <Outlet />
      </main>

      <EventDrawer
        event={editingEvent}
        onSave={handleSaveEvent}
        onClose={() => setEditingId(null)}
        onDelete={handleDeleteEvent}
      />

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
};
