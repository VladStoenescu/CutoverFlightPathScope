import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppState, CutoverEvent } from '../models';
import { createEvent, computeDerivedMetrics } from '../models';
import { loadState, saveState, clearState, exportJSON, importJSON } from '../storage';
import { demoData } from '../demoData';

const DEFAULT_STATE: AppState = {
  config: {
    programName: 'My Migration Program',
    cutoverDate: '',
    readinessTarget: 100,
  },
  events: [],
};

interface AppContextValue {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  sortedEvents: CutoverEvent[];
  currentMetrics: ReturnType<typeof computeDerivedMetrics> | null;
  eventsRemaining: number;
  handleAddEvent: (type: 'DRH' | 'MDR') => void;
  handleSaveEvent: (event: CutoverEvent) => void;
  handleDeleteEvent: (id: string) => void;
  handleReset: () => void;
  handleLoadDemo: () => void;
  handleExport: () => void;
  handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadState() ?? DEFAULT_STATE);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const sortedEvents = [...state.events].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  const latestEvent = sortedEvents[sortedEvents.length - 1];
  const currentMetrics = latestEvent ? computeDerivedMetrics(latestEvent) : null;

  // Events without a date or when no go-live window is set are assumed to be
  // before the go-live window and therefore still remaining.
  const eventsRemaining = state.events.filter((e) => {
    if (e.completed) return false;
    const end = state.config.goLiveWindowEnd;
    if (!end || !e.date) return true;
    return new Date(e.date + 'T00:00:00') <= new Date(end + 'T00:00:00');
  }).length;

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

  return (
    <AppContext.Provider value={{
      state, setState, editingId, setEditingId,
      sortedEvents, currentMetrics, eventsRemaining,
      handleAddEvent, handleSaveEvent, handleDeleteEvent,
      handleReset, handleLoadDemo, handleExport, handleImport,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
