import { create } from 'zustand';

interface PwaState {
  needRefresh: boolean;
  offlineReady: boolean;
  registration?: ServiceWorkerRegistration;
  applyUpdate: () => void;
  set: (p: Partial<PwaState>) => void;
}

export const usePwaStore = create<PwaState>((set) => ({
  needRefresh: false,
  offlineReady: false,
  applyUpdate: () => {},
  set: (p) => set(p),
}));
