// Ephemeral UI state: toasts with undo, set focus, last finish summary.
import { create } from 'zustand';
import type { Workout } from '../domain/types';

export interface Toast {
  id: number;
  message: string;
  undo?: () => void;
}

export interface FinishSummary {
  workout: Workout;
  templateChanged: boolean;
}

interface UiState {
  toast: Toast | null;
  showToast: (message: string, undo?: () => void) => void;
  dismissToast: () => void;

  highlightSetId: string | null;
  setHighlight: (id: string | null) => void;

  summary: FinishSummary | null;
  setSummary: (s: FinishSummary | null) => void;
}

let toastSeq = 0;

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  showToast: (message, undo) => set({ toast: { id: ++toastSeq, message, undo } }),
  dismissToast: () => set({ toast: null }),

  highlightSetId: null,
  setHighlight: (id) => set({ highlightSetId: id }),

  summary: null,
  setSummary: (summary) => set({ summary }),
}));
