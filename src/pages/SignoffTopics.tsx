import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import type { SignoffTopic, TopicCriteria, Defect } from '../models';

const STATUS_COLORS: Record<SignoffTopic['status'], string> = {
  'not-started': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  'in-review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'signed-off': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'blocked': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const SEV_COLORS: Record<number, string> = {
  1: 'bg-red-600 text-white',
  2: 'bg-orange-500 text-white',
  3: 'bg-yellow-400 text-slate-900',
  4: 'bg-slate-200 text-slate-700',
};

function newId() {
  return crypto.randomUUID();
}

export const SignoffTopics: React.FC = () => {
  const {
    state,
    handleSaveTopic, handleDeleteTopic,
    handleSaveCriteria, handleDeleteCriteria,
    handleSaveDefect, handleDeleteDefect,
  } = useApp();

  const topics = state.topics ?? [];
  const criteria = state.criteria ?? [];
  const defects = state.defects ?? [];
  const eventNameMap = new Map(state.events.map(e => [e.id, e.name]));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SignoffTopic['status'] | 'all'>('all');
  const [riskAccepted, setRiskAccepted] = useState<Record<string, boolean>>({});

  const selected = topics.find(t => t.id === selectedId) ?? null;

  const filtered = topics.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const topicCriteria = (id: string) => criteria.filter(c => c.topicId === id);
  const topicDefects = (id: string) => defects.filter(d => d.linkedTopicIds.includes(id));
  const criteriaPassRate = (id: string) => {
    const tc = topicCriteria(id);
    if (!tc.length) return null;
    const pass = tc.filter(c => c.status === 'pass').length;
    return Math.round((pass / tc.length) * 100);
  };
  const openDefectsCount = (id: string) =>
    topicDefects(id).filter(d => d.status === 'open' || d.status === 'in-progress').length;

  const canSignOff = (id: string) => {
    const tc = topicCriteria(id);
    const hasFailing = tc.some(c => c.status === 'fail');
    const hasSev1Open = topicDefects(id).some(d => d.severity === 1 && (d.status === 'open' || d.status === 'in-progress'));
    return !hasFailing && !hasSev1Open;
  };

  const handleAddTopic = () => {
    const name = prompt('Topic name:');
    if (!name) return;
    const owner = prompt('Owner:') ?? '';
    const topic: SignoffTopic = {
      id: newId(), name, owner, status: 'not-started',
    };
    handleSaveTopic(topic);
    setSelectedId(topic.id);
  };

  const handleAddCriteria = (topicId: string) => {
    const description = prompt('Criteria description:');
    if (!description) return;
    handleSaveCriteria({ id: newId(), topicId, description, status: 'n/a' });
  };

  const handleAddDefect = (topicId: string) => {
    const title = prompt('Defect title:');
    if (!title) return;
    const sevStr = prompt('Severity (1-4):') ?? '3';
    const severity = Math.min(4, Math.max(1, parseInt(sevStr, 10) || 3)) as 1 | 2 | 3 | 4;
    const topic = topics.find(t => t.id === topicId);
    handleSaveDefect({
      id: newId(), title, severity, status: 'open',
      linkedTopicIds: [topicId],
      linkedEventId: topic?.linkedEventId,
      createdAt: new Date().toISOString(),
    });
  };

  const handleSignOff = (topic: SignoffTopic) => {
    handleSaveTopic({ ...topic, status: 'signed-off', signedOffAt: new Date().toISOString() });
  };

  const handleTopicStatusChange = (topic: SignoffTopic, status: SignoffTopic['status']) => {
    handleSaveTopic({ ...topic, status });
  };

  const handleCriteriaToggle = (c: TopicCriteria) => {
    const next: TopicCriteria['status'] = c.status === 'pass' ? 'fail' : c.status === 'fail' ? 'n/a' : 'pass';
    handleSaveCriteria({ ...c, status: next });
  };

  const handleDefectStatusChange = (d: Defect, status: Defect['status']) => {
    handleSaveDefect({ ...d, status, closedAt: status === 'closed' ? new Date().toISOString() : d.closedAt });
  };

  const STATUSES: SignoffTopic['status'][] = ['not-started', 'in-review', 'signed-off', 'blocked'];

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]">
      {/* Left panel */}
      <div className="w-1/3 flex flex-col gap-2 min-w-0">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-white dark:bg-slate-800 border border-n-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-p-blue dark:text-slate-200"
          />
          <button
            onClick={handleAddTopic}
            className="bg-p-blue hover:bg-navy text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
            title="Add topic"
          >
            +
          </button>
        </div>

        {/* Status filter chips */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${statusFilter === 'all' ? 'bg-p-blue text-white border-p-blue' : 'border-n-200 dark:border-slate-700 text-n-600 dark:text-slate-400'}`}
          >
            All
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2 py-0.5 rounded-full text-xs border transition-colors ${statusFilter === s ? 'bg-p-blue text-white border-p-blue' : 'border-n-200 dark:border-slate-700 text-n-600 dark:text-slate-400'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Topic list */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.length === 0 && (
            <div className="text-sm text-n-600 dark:text-slate-500 text-center py-8">No topics yet. Click + to add.</div>
          )}
          {filtered.map(t => {
            const rate = criteriaPassRate(t.id);
            const openDef = openDefectsCount(t.id);
            return (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${selectedId === t.id ? 'bg-p-blue/10 border-p-blue dark:border-indigo-500' : 'bg-white dark:bg-slate-900/50 border-n-200 dark:border-slate-800 hover:border-p-blue/50'}`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-medium text-sm text-n-900 dark:text-slate-200 truncate">{t.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                </div>
                <div className="text-xs text-n-600 dark:text-slate-500 flex gap-3">
                  <span>👤 {t.owner}</span>
                  {rate !== null && <span>✅ {rate}%</span>}
                  {openDef > 0 && <span className="text-red-600 dark:text-red-400">🐛 {openDef}</span>}
                  {t.linkedEventId && <span className="text-p-blue dark:text-indigo-400">🔗 {eventNameMap.get(t.linkedEventId) ?? '?'}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-2/3 min-w-0 overflow-y-auto">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-n-600 dark:text-slate-500 text-sm">
            Select a topic to view details
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-lg font-bold text-n-900 dark:text-slate-200">{selected.name}</h2>
                  <div className="text-xs text-n-600 dark:text-slate-500 mt-0.5">
                    👤 {selected.owner}
                    {selected.domain && <span className="ml-3">🏷 {selected.domain}</span>}
                    {selected.signedOffAt && <span className="ml-3 text-green-600 dark:text-green-400">✅ Signed off {new Date(selected.signedOffAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selected.status}
                    onChange={e => handleTopicStatusChange(selected, e.target.value as SignoffTopic['status'])}
                    className="bg-n-50 dark:bg-slate-800 border border-n-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => { if (confirm('Delete this topic?')) { handleDeleteTopic(selected.id); setSelectedId(null); } }}
                    className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>

              {/* Rationale */}
              <div className="mt-3">
                <label className="text-xs text-n-600 dark:text-slate-500 block mb-1">Rationale</label>
                <textarea
                  value={selected.rationale ?? ''}
                  onChange={e => handleSaveTopic({ ...selected, rationale: e.target.value })}
                  rows={2}
                  className="w-full bg-n-50 dark:bg-slate-800 border border-n-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-p-blue resize-none dark:text-slate-200"
                  placeholder="Rationale for sign-off..."
                />
              </div>

              {/* Linked Event */}
              <div className="mt-3">
                <label className="text-xs text-n-600 dark:text-slate-500 block mb-1">Linked Event</label>
                <select
                  value={selected.linkedEventId ?? ''}
                  onChange={e => handleSaveTopic({ ...selected, linkedEventId: e.target.value || undefined })}
                  className="w-full bg-n-50 dark:bg-slate-800 border border-n-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-p-blue dark:text-slate-200"
                >
                  <option value="">— Not linked to an event —</option>
                  {state.events.sort((a, b) => a.sequenceNumber - b.sequenceNumber).map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name} {ev.date ? `(${ev.date})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Criteria */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-n-900 dark:text-slate-300">Criteria</h3>
                <button
                  onClick={() => handleAddCriteria(selected.id)}
                  className="text-xs bg-p-blue/10 hover:bg-p-blue/20 text-p-blue dark:text-indigo-400 px-2 py-0.5 rounded transition-colors"
                >
                  + Add
                </button>
              </div>
              {topicCriteria(selected.id).length === 0 ? (
                <p className="text-xs text-n-600 dark:text-slate-500">No criteria yet.</p>
              ) : (
                <div className="space-y-1">
                  {topicCriteria(selected.id).map(c => (
                    <div key={c.id} className="flex items-center gap-2 group">
                      <button
                        onClick={() => handleCriteriaToggle(c)}
                        className={`shrink-0 w-16 text-center text-xs px-1.5 py-0.5 rounded-full border transition-colors ${
                          c.status === 'pass' ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700' :
                          c.status === 'fail' ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700' :
                          'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-400 dark:border-slate-600'
                        }`}
                      >
                        {c.status}
                      </button>
                      <span className="flex-1 text-xs text-n-900 dark:text-slate-300">{c.description}</span>
                      <button
                        onClick={() => handleDeleteCriteria(c.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Defects */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-n-900 dark:text-slate-300">Linked Defects</h3>
                <button
                  onClick={() => handleAddDefect(selected.id)}
                  className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 px-2 py-0.5 rounded transition-colors"
                >
                  + Add Defect
                </button>
              </div>
              {topicDefects(selected.id).length === 0 ? (
                <p className="text-xs text-n-600 dark:text-slate-500">No defects linked.</p>
              ) : (
                <div className="space-y-1">
                  {topicDefects(selected.id).map(d => (
                    <div key={d.id} className="flex items-center gap-2 group">
                      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full font-bold ${SEV_COLORS[d.severity]}`}>
                        S{d.severity}
                      </span>
                      <span className={`flex-1 text-xs ${d.status === 'closed' ? 'line-through text-n-400 dark:text-slate-600' : 'text-n-900 dark:text-slate-300'}`}>
                        {d.title}
                      </span>
                      <select
                        value={d.status}
                        onChange={e => handleDefectStatusChange(d, e.target.value as Defect['status'])}
                        className="text-xs bg-n-50 dark:bg-slate-800 border border-n-200 dark:border-slate-700 rounded px-1 py-0.5 focus:outline-none"
                      >
                        <option value="open">open</option>
                        <option value="in-progress">in-progress</option>
                        <option value="closed">closed</option>
                      </select>
                      <button
                        onClick={() => handleDeleteDefect(d.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sign-off */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-n-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs text-n-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={riskAccepted[selected.id] ?? false}
                    onChange={e => setRiskAccepted(r => ({ ...r, [selected.id]: e.target.checked }))}
                    className="accent-amber-500"
                  />
                  Risk Accepted (override criteria)
                </label>
              </div>
              <button
                disabled={!riskAccepted[selected.id] && !canSignOff(selected.id)}
                onClick={() => handleSignOff(selected)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  (riskAccepted[selected.id] || canSignOff(selected.id))
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-n-200 dark:bg-slate-700 text-n-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                ✅ Sign Off
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
