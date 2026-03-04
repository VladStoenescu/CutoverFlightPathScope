import React from 'react';
import { EventCard } from './EventCard';
import type { CutoverEvent } from '../models';

interface Props {
  events: CutoverEvent[];
  onEdit: (id: string) => void;
  goLiveDate: string;
  annotations?: { eventId: string; text: string; timestamp: string }[];
  onAddAnnotation?: (eventId: string) => void;
}

export const Timeline: React.FC<Props> = ({ events, onEdit, goLiveDate, annotations = [], onAddAnnotation }) => {
  const sorted = [...events].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  return (
    <div className="relative">
      {/* Connector line */}
      <div className="absolute top-8 left-0 right-0 h-0.5 bg-slate-700 z-0" style={{ marginLeft: '12px', marginRight: '12px' }} />
      
      <div className="relative z-10 flex items-start gap-4 overflow-x-auto pb-2">
        {sorted.map((event, idx) => {
          const eventAnnotations = annotations.filter(a => a.eventId === event.id);
          return (
            <div key={event.id} className="flex flex-col items-center" style={{ minWidth: 200 }}>
              {/* Connector dot */}
              <div
                className="w-4 h-4 rounded-full border-2 border-slate-700 mb-2 flex-shrink-0"
                style={{
                  background: idx === sorted.length - 1 ? '#6366f1' : '#334155',
                  borderColor: idx === sorted.length - 1 ? '#6366f1' : '#475569',
                }}
              />
              <EventCard
                event={event}
                onEdit={onEdit}
                isLatest={idx === sorted.length - 1}
              />
              {/* Annotation bubbles */}
              {eventAnnotations.length > 0 && (
                <div className="mt-2 space-y-1 w-full">
                  {eventAnnotations.map((ann, ai) => (
                    <div key={ai} className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded-lg px-2 py-1 text-xs text-yellow-900 dark:text-yellow-200 break-words">
                      💬 {ann.text}
                    </div>
                  ))}
                </div>
              )}
              {onAddAnnotation && (
                <button
                  onClick={() => onAddAnnotation(event.id)}
                  className="mt-1 text-xs text-n-600 dark:text-slate-500 hover:text-p-blue dark:hover:text-indigo-400 transition-colors"
                  title="Add annotation"
                >
                  + note
                </button>
              )}
            </div>
          );
        })}

        {/* Go-Live milestone */}
        {goLiveDate && (
          <div className="flex flex-col items-center" style={{ minWidth: 120 }}>
            <div className="w-4 h-4 rounded-full mb-2 flex-shrink-0 bg-emerald-500 border-2 border-emerald-400 animate-pulse" />
            <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-4 text-center" style={{ minWidth: 120 }}>
              <div className="text-xs text-emerald-400 font-semibold mb-1">🎯 GO-LIVE</div>
              <div className="text-xs text-emerald-300">
                {new Date(goLiveDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-1">100%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
