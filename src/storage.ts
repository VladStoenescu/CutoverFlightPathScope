import type { AppState } from './models';

const API_BASE = '/api';

// ─── API-backed persistence ───────────────────────────────────────────────────

export async function loadStateFromAPI(): Promise<AppState | null> {
  try {
    const res = await fetch(`${API_BASE}/state`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as AppState;
  } catch {
    return null;
  }
}

export async function saveStateToAPI(state: AppState): Promise<void> {
  try {
    await fetch(`${API_BASE}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
  } catch {
    // network unavailable – silently ignore so the UI stays functional
  }
}

export async function clearStateFromAPI(): Promise<void> {
  try {
    await fetch(`${API_BASE}/state`, { method: 'DELETE' });
  } catch {
    // ignore
  }
}

// ─── JSON file import / export (unchanged) ───────────────────────────────────

export function exportJSON(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cutover-flightpath-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target?.result as string) as AppState;
        resolve(state);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

