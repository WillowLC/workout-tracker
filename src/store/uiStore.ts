// Ephemeral UI state: toasts with undo, rest timer, set focus, last finish summary.
import { create } from 'zustand';
import type { Workout } from '../domain/types';

export interface Toast {
  id: number;
  message: string;
  undo?: () => void;
}

export interface RestTimer {
  endAt: number;
  duration: number; // seconds, for progress
  label?: string;
}

export interface FinishSummary {
  workout: Workout;
  templateChanged: boolean;
}

interface UiState {
  toast: Toast | null;
  showToast: (message: string, undo?: () => void) => void;
  dismissToast: () => void;

  rest: RestTimer | null;
  startRest: (seconds: number, label?: string) => void;
  adjustRest: (deltaSec: number) => void;
  stopRest: () => void;

  highlightSetId: string | null;
  setHighlight: (id: string | null) => void;

  summary: FinishSummary | null;
  setSummary: (s: FinishSummary | null) => void;
}

const REST_KEY = 'jim.rest';
function loadRest(): RestTimer | null {
  try {
    const r = JSON.parse(localStorage.getItem(REST_KEY) ?? 'null') as RestTimer | null;
    return r && r.endAt > Date.now() ? r : null;
  } catch {
    return null;
  }
}
function saveRest(r: RestTimer | null) {
  try {
    if (r) localStorage.setItem(REST_KEY, JSON.stringify(r));
    else localStorage.removeItem(REST_KEY);
  } catch {
    /* storage unavailable */
  }
}

let toastSeq = 0;

export const useUiStore = create<UiState>((set, get) => ({
  toast: null,
  showToast: (message, undo) => set({ toast: { id: ++toastSeq, message, undo } }),
  dismissToast: () => set({ toast: null }),

  rest: loadRest(),
  startRest: (seconds, label) => {
    const r = { endAt: Date.now() + seconds * 1000, duration: seconds, label };
    saveRest(r);
    set({ rest: r });
  },
  adjustRest: (delta) => {
    const r = get().rest;
    if (!r) return;
    const endAt = r.endAt + delta * 1000;
    if (endAt <= Date.now()) return get().stopRest();
    const next = { ...r, endAt, duration: Math.max(1, r.duration + delta) };
    saveRest(next);
    set({ rest: next });
  },
  stopRest: () => {
    saveRest(null);
    set({ rest: null });
  },

  highlightSetId: null,
  setHighlight: (id) => set({ highlightSetId: id }),

  summary: null,
  setSummary: (summary) => set({ summary }),
}));
