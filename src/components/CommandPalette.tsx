import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

interface Command {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<Props> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { handleAddEvent, handleLoadDemo, setExportMode, state, sortedEvents } = useApp();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'overview', label: 'Go to Overview', icon: '🏠', action: () => { navigate('/'); onClose(); } },
    { id: 'scope', label: 'Go to Scope', icon: '🗂', action: () => { navigate('/scope'); onClose(); } },
    { id: 'quant', label: 'Go to Quantitative', icon: '📐', action: () => { navigate('/quant'); onClose(); } },
    { id: 'qual', label: 'Go to Qualitative', icon: '✅', action: () => { navigate('/qual'); onClose(); } },
    { id: 'insights', label: 'Go to Insights', icon: '📊', action: () => { navigate('/insights'); onClose(); } },
    { id: 'signoff', label: 'Go to Sign-off Topics', icon: '📋', action: () => { navigate('/signoff'); onClose(); } },
    { id: 'add-drh', label: 'Add DRH Event', icon: '➕', action: () => { handleAddEvent('DRH'); onClose(); } },
    { id: 'add-mdr', label: 'Add MDR Event', icon: '➕', action: () => { handleAddEvent('MDR'); onClose(); } },
    {
      id: 'export',
      label: 'Export PPTX',
      icon: '📤',
      action: async () => {
        onClose();
        const { exportPptx } = await import('../export/pptxExport');
        setExportMode(true);
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        await exportPptx(state, sortedEvents, true);
        setExportMode(false);
      },
    },
    { id: 'demo', label: 'Load Demo Data', icon: '🎭', action: () => { handleLoadDemo(); onClose(); } },
  ];

  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setCursor(0);
  }, [query, open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKey = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setCursor(c => Math.min(c + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setCursor(c => Math.max(c - 1, 0));
        break;
      case 'Enter':
        filtered[cursor]?.action();
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-n-200 dark:border-slate-700 w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-3 border-b border-n-200 dark:border-slate-700">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            className="w-full bg-transparent text-n-900 dark:text-slate-100 placeholder-n-400 dark:placeholder-slate-500 focus:outline-none text-sm"
          />
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="text-sm text-n-500 dark:text-slate-500 px-4 py-3">No commands found.</div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={cmd.action}
              onMouseEnter={() => setCursor(i)}
              className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                i === cursor
                  ? 'bg-p-blue/10 dark:bg-indigo-900/40 text-p-blue dark:text-indigo-300'
                  : 'text-n-900 dark:text-slate-200 hover:bg-n-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-base">{cmd.icon}</span>
              <span>{cmd.label}</span>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-n-200 dark:border-slate-700 text-xs text-n-400 dark:text-slate-600 flex gap-3">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  );
};
