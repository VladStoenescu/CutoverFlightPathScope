import React, { useState, useEffect } from 'react';
import type { CutoverEvent } from '../models';
import { computeDerivedMetrics } from '../models';

interface Props {
  event: CutoverEvent | null;
  onSave: (event: CutoverEvent) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

type Tab = 'goals' | 'scope' | 'quantitative' | 'qualitative' | 'notes';

const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}> = ({ label, value, onChange, min = 0, max }) => (
  <div className="flex flex-col gap-0.5">
    <label className="text-xs text-slate-400">{label}</label>
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (max !== undefined && v > max) return;
        if (v < (min ?? 0)) return;
        onChange(v);
      }}
      className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 w-full"
    />
  </div>
);

export const EventDrawer: React.FC<Props> = ({ event, onSave, onClose, onDelete }) => {
  const [draft, setDraft] = useState<CutoverEvent | null>(null);
  const [tab, setTab] = useState<Tab>('goals');
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    if (event) {
      setDraft(JSON.parse(JSON.stringify(event)));
      setTab('goals');
    }
  }, [event]);

  if (!event || !draft) return null;

  const metrics = computeDerivedMetrics(draft);

  const updateScope = (key: keyof typeof draft.scope, val: number) => {
    setDraft({ ...draft, scope: { ...draft.scope, [key]: val } });
  };
  const updateRecords = (key: keyof typeof draft.quantitative.records, val: number) => {
    setDraft({ ...draft, quantitative: { ...draft.quantitative, records: { ...draft.quantitative.records, [key]: val } } });
  };
  const updateRuntime = (key: keyof typeof draft.quantitative.runtime, val: number) => {
    setDraft({ ...draft, quantitative: { ...draft.quantitative, runtime: { ...draft.quantitative.runtime, [key]: val } } });
  };
  const updateQual = (key: keyof typeof draft.qualitative, val: number) => {
    setDraft({ ...draft, qualitative: { ...draft.qualitative, [key]: val } });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'goals', label: 'Goals' },
    { id: 'scope', label: 'Scope' },
    { id: 'quantitative', label: 'Quantitative' },
    { id: 'qualitative', label: 'Qualitative' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/60 cursor-pointer" onClick={onClose} />
      
      {/* Drawer */}
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-100">{draft.name}</span>
              <span className="text-sm px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300">{draft.type}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <input
                type="date"
                value={draft.date}
                onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                className="bg-transparent border-none text-sm text-slate-400 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: metrics.overallReadinessPct >= 90 ? '#10b981' : metrics.overallReadinessPct >= 70 ? '#f59e0b' : '#ef4444' }}>
                {metrics.overallReadinessPct}%
              </div>
              <div className="text-xs text-slate-500">Overall</div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-800/50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.id ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'goals' && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-slate-300">Goals for {draft.name}</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newGoal.trim()) {
                      setDraft({ ...draft, goals: [...draft.goals, newGoal.trim()] });
                      setNewGoal('');
                    }
                  }}
                  placeholder="Add a goal and press Enter..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => {
                    if (newGoal.trim()) {
                      setDraft({ ...draft, goals: [...draft.goals, newGoal.trim()] });
                      setNewGoal('');
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 rounded transition-colors"
                >
                  Add
                </button>
              </div>
              {draft.goals.length === 0 && (
                <div className="text-slate-500 text-sm text-center py-4">No goals added yet.</div>
              )}
              <div className="space-y-2">
                {draft.goals.map((goal, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-800 rounded-lg p-3">
                    <span className="text-indigo-400 text-xs mt-0.5 font-bold">#{idx + 1}</span>
                    <span className="flex-1 text-sm text-slate-200">{goal}</span>
                    <button
                      onClick={() => setDraft({ ...draft, goals: draft.goals.filter((_, i) => i !== idx) })}
                      className="text-slate-500 hover:text-red-400 text-xs flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'scope' && (
            <div className="space-y-4">
              <div className="text-sm text-slate-400 mb-2">Scope coverage % (0–100) for each area</div>
              <div className="text-xs text-slate-500 mb-2">Live scope readiness: <span className="text-indigo-300 font-bold">{metrics.scopeReadinessPct}%</span></div>
              {[
                { label: 'Runbook Scope', planned: 'runbookScopePctPlanned' as const, actual: 'runbookScopePctActual' as const },
                { label: 'Migration Scope', planned: 'migrationScopePctPlanned' as const, actual: 'migrationScopePctActual' as const },
                { label: 'Applications Scope', planned: 'applicationsScopePctPlanned' as const, actual: 'applicationsScopePctActual' as const },
                { label: 'Legacy ID Conversion', planned: 'legacyIdConversionScopePctPlanned' as const, actual: 'legacyIdConversionScopePctActual' as const },
              ].map((item) => (
                <div key={item.label} className="bg-slate-800 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium text-slate-200">{item.label}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberInput label="Planned %" value={draft.scope[item.planned]} onChange={(v) => updateScope(item.planned, v)} max={100} />
                    <NumberInput label="Actual %" value={draft.scope[item.actual]} onChange={(v) => updateScope(item.actual, v)} max={100} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'quantitative' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 mb-2">Live quant readiness: <span className="text-indigo-300 font-bold">{metrics.quantitativeReadinessPct}%</span></div>
              <div className="bg-slate-800 rounded-lg p-3 space-y-3">
                <div className="text-sm font-medium text-slate-200">Records Migrated</div>
                {[
                  { label: 'Reference Data', planned: 'referenceDataPlanned' as const, actual: 'referenceDataActual' as const },
                  { label: 'Static Data', planned: 'staticDataPlanned' as const, actual: 'staticDataActual' as const },
                  { label: 'Transaction + Position', planned: 'transactionPositionPlanned' as const, actual: 'transactionPositionActual' as const },
                  { label: 'Inflight Data', planned: 'inflightDataPlanned' as const, actual: 'inflightDataActual' as const },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <NumberInput label="Planned" value={draft.quantitative.records[item.planned]} onChange={(v) => updateRecords(item.planned, v)} />
                      <NumberInput label="Actual" value={draft.quantitative.records[item.actual]} onChange={(v) => updateRecords(item.actual, v)} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="text-sm font-medium text-slate-200">Runbook Runtime</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Expected (min)" value={draft.quantitative.runtime.expectedRunbookRuntimeMinutes} onChange={(v) => updateRuntime('expectedRunbookRuntimeMinutes', v)} />
                  <NumberInput label="Actual (min)" value={draft.quantitative.runtime.actualRunbookRuntimeMinutes} onChange={(v) => updateRuntime('actualRunbookRuntimeMinutes', v)} />
                </div>
              </div>
            </div>
          )}

          {tab === 'qualitative' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 mb-2">Live qual readiness: <span className="text-indigo-300 font-bold">{metrics.qualitativeReadinessPct}%</span></div>
              <div className="bg-slate-800 rounded-lg p-3 space-y-3">
                <div className="text-sm font-medium text-slate-200">Open Defects</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Expected" value={draft.qualitative.expectedOpenDefects} onChange={(v) => updateQual('expectedOpenDefects', v)} />
                  <NumberInput label="Actual" value={draft.qualitative.actualOpenDefects} onChange={(v) => updateQual('actualOpenDefects', v)} />
                </div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 space-y-3">
                <div className="text-sm font-medium text-slate-200">Reconciliation Breaks</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Expected" value={draft.qualitative.expectedReconciliationBreaks} onChange={(v) => updateQual('expectedReconciliationBreaks', v)} />
                  <NumberInput label="Actual" value={draft.qualitative.actualReconciliationBreaks} onChange={(v) => updateQual('actualReconciliationBreaks', v)} />
                </div>
              </div>
              <div className="bg-slate-800 rounded-lg p-3 space-y-3">
                <div className="text-sm font-medium text-slate-200">Topics Sign-off</div>
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput label="Signed Off" value={draft.qualitative.topicsSignedOffCount} onChange={(v) => updateQual('topicsSignedOffCount', Math.min(v, draft.qualitative.topicsTotalCount))} />
                  <NumberInput label="Total Topics" value={draft.qualitative.topicsTotalCount} onChange={(v) => updateQual('topicsTotalCount', v)} />
                </div>
              </div>
            </div>
          )}

          {tab === 'notes' && (
            <div className="space-y-2">
              <div className="text-sm text-slate-400">Notes / observations for {draft.name}</div>
              <textarea
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Add notes, observations, action items..."
                rows={10}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-800 flex justify-between items-center">
          <button
            onClick={() => onDelete(draft.id)}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Delete Event
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(draft)}
              className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
