import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppState, CutoverEvent, SignoffTopic, TopicCriteria, Defect } from '../models';
import { createEvent, computeDerivedMetrics } from '../models';
import { loadState, saveState, clearState, exportJSON, importJSON } from '../storage';
import { demoData } from '../demoData';

const DEFAULT_STATE: AppState = {
  config: {
    programName: 'My Migration Program',
    goLiveDate: '',
    readinessTarget: 100,
  },
  events: [],
  topics: [],
  criteria: [],
  defects: [],
  annotations: [],
  role: 'working',
  compactMode: false,
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
  exportMode: boolean;
  setExportMode: (v: boolean) => void;
  // Topic/Criteria/Defect helpers
  handleSaveTopic: (topic: SignoffTopic) => void;
  handleDeleteTopic: (id: string) => void;
  handleSaveCriteria: (criteria: TopicCriteria) => void;
  handleDeleteCriteria: (id: string) => void;
  handleSaveDefect: (defect: Defect) => void;
  handleDeleteDefect: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadState();
    if (!loaded) return DEFAULT_STATE;
    // Migrate old cutoverDate -> goLiveDate without mutating
    const rawCfg = loaded.config as AppState['config'] & { cutoverDate?: string };
    const migratedConfig = rawCfg.cutoverDate && !rawCfg.goLiveDate
      ? { ...rawCfg, goLiveDate: rawCfg.cutoverDate, cutoverDate: undefined }
      : rawCfg;
    return {
      ...DEFAULT_STATE,
      ...loaded,
      config: { ...DEFAULT_STATE.config, ...migratedConfig },
    };
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [exportMode, setExportMode] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const sortedEvents = [...state.events].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  const latestEvent = sortedEvents[sortedEvents.length - 1];
  const currentMetrics = latestEvent ? computeDerivedMetrics(latestEvent) : null;

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
      setState({ ...DEFAULT_STATE, ...imported, config: { ...DEFAULT_STATE.config, ...imported.config } });
    } catch {
      alert('Failed to import JSON. Please check the file format.');
    }
    e.target.value = '';
  };

  const handleSaveTopic = (topic: SignoffTopic) => {
    setState(s => {
      const exists = s.topics.some(t => t.id === topic.id);
      return { ...s, topics: exists ? s.topics.map(t => t.id === topic.id ? topic : t) : [...s.topics, topic] };
    });
  };
  const handleDeleteTopic = (id: string) => {
    setState(s => ({ ...s, topics: s.topics.filter(t => t.id !== id) }));
  };
  const handleSaveCriteria = (criteria: TopicCriteria) => {
    setState(s => {
      const exists = s.criteria.some(c => c.id === criteria.id);
      return { ...s, criteria: exists ? s.criteria.map(c => c.id === criteria.id ? criteria : c) : [...s.criteria, criteria] };
    });
  };
  const handleDeleteCriteria = (id: string) => {
    setState(s => ({ ...s, criteria: s.criteria.filter(c => c.id !== id) }));
  };
  const handleSaveDefect = (defect: Defect) => {
    setState(s => {
      const exists = s.defects.some(d => d.id === defect.id);
      return { ...s, defects: exists ? s.defects.map(d => d.id === defect.id ? defect : d) : [...s.defects, defect] };
    });
  };
  const handleDeleteDefect = (id: string) => {
    setState(s => ({ ...s, defects: s.defects.filter(d => d.id !== id) }));
  };

  return (
    <AppContext.Provider value={{
      state, setState, editingId, setEditingId,
      sortedEvents, currentMetrics, eventsRemaining,
      handleAddEvent, handleSaveEvent, handleDeleteEvent,
      handleReset, handleLoadDemo, handleExport, handleImport,
      exportMode, setExportMode,
      handleSaveTopic, handleDeleteTopic,
      handleSaveCriteria, handleDeleteCriteria,
      handleSaveDefect, handleDeleteDefect,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
