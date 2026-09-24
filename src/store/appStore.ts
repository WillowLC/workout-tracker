// Application data store. Holds everything in memory (the data set is small)
// and writes through to IndexedDB on every change via src/db/repo.ts.
import { create } from 'zustand';
import type { Exercise, Settings, Template, Workout } from '../domain/types';
import { DEFAULT_SETTINGS } from '../domain/types';
import * as repo from '../db/repo';
import { createEmptyWorkout, repeatWorkout, workoutFromTemplate } from '../domain/workoutOps';
import { mergeById, type Backup } from '../domain/backup';
import { newId } from '../domain/ids';
import { lbToKg } from '../domain/units';

export interface AppMeta {
  lastBackupAt?: number;
  backupSnoozedUntil?: number;
  persistGranted?: boolean | null; // null = API unsupported
  installHintDismissed?: boolean;
}

interface AppState {
  ready: boolean;
  exercises: Exercise[];
  /** Finished workouts only. */
  workouts: Workout[];
  templates: Template[];
  settings: Settings;
  active: Workout | null;
  meta: AppMeta;

  init: () => Promise<void>;

  // Active workout
  startWorkout: (from?: { template?: Template; repeat?: Workout }) => Workout;
  updateActive: (fn: (w: Workout) => Workout) => void;
  finishActive: (finished: Workout) => Promise<void>;
  cancelActive: () => Promise<void>;

  // History
  saveWorkout: (w: Workout) => Promise<void>;
  deleteWorkout: (id: string) => Promise<Workout | undefined>;

  // Templates
  saveTemplate: (t: Template) => Promise<void>;
  deleteTemplate: (id: string) => Promise<Template | undefined>;

  // Exercises
  saveExercise: (e: Exercise) => Promise<void>;
  createExercise: (e: Omit<Exercise, 'id' | 'isCustom'>) => Promise<Exercise>;

  // Settings & meta
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  setMeta: (patch: AppMeta) => Promise<void>;

  // Data
  importBackup: (b: Backup, mode: 'replace' | 'merge') => Promise<{ added: number; skipped: number }>;
  resetAll: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  exercises: [],
  workouts: [],
  templates: [],
  settings: DEFAULT_SETTINGS,
  active: null,
  meta: {},

  init: async () => {
    const data = await repo.loadAll();
    const [lastBackupAt, backupSnoozedUntil, persistGranted, installHintDismissed] = await Promise.all([
      repo.getMeta<number>('lastBackupAt'),
      repo.getMeta<number>('backupSnoozedUntil'),
      repo.getMeta<boolean | null>('persistGranted'),
      repo.getMeta<boolean>('installHintDismissed'),
    ]);
    const active = data.workouts.find((w) => w.finishedAt === undefined) ?? null;
    set({
      ready: true,
      exercises: data.exercises,
      workouts: data.workouts.filter((w) => w.finishedAt !== undefined),
      templates: data.templates,
      settings: data.settings,
      active,
      meta: { lastBackupAt, backupSnoozedUntil, persistGranted, installHintDismissed },
    });
  },

  startWorkout: (from) => {
    const now = Date.now();
    const w = from?.template ? workoutFromTemplate(from.template, now) : from?.repeat ? repeatWorkout(from.repeat, now) : createEmptyWorkout(now);
    set({ active: w });
    void repo.putWorkout(w);
    return w;
  },

  updateActive: (fn) => {
    const cur = get().active;
    if (!cur) return;
    const next = fn(cur);
    if (next === cur) return;
    set({ active: next });
    void repo.putWorkout(next); // persisted on every change
  },

  finishActive: async (finished) => {
    set((s) => ({ active: null, workouts: [...s.workouts.filter((w) => w.id !== finished.id), finished] }));
    await repo.putWorkout(finished);
  },

  cancelActive: async () => {
    const cur = get().active;
    set({ active: null });
    if (cur) await repo.deleteWorkoutRow(cur.id);
  },

  saveWorkout: async (w) => {
    set((s) => ({ workouts: [...s.workouts.filter((x) => x.id !== w.id), w] }));
    await repo.putWorkout(w);
  },

  deleteWorkout: async (id) => {
    const w = get().workouts.find((x) => x.id === id);
    set((s) => ({ workouts: s.workouts.filter((x) => x.id !== id) }));
    await repo.deleteWorkoutRow(id);
    return w;
  },

  saveTemplate: async (t) => {
    set((s) => ({ templates: [...s.templates.filter((x) => x.id !== t.id), t] }));
    await repo.putTemplate(t);
  },

  deleteTemplate: async (id) => {
    const t = get().templates.find((x) => x.id === id);
    set((s) => ({ templates: s.templates.filter((x) => x.id !== id) }));
    await repo.deleteTemplateRow(id);
    return t;
  },

  saveExercise: async (e) => {
    set((s) => ({ exercises: [...s.exercises.filter((x) => x.id !== e.id), e] }));
    await repo.putExercise(e);
  },

  createExercise: async (e) => {
    const ex: Exercise = { ...e, id: newId(), isCustom: true };
    await get().saveExercise(ex);
    return ex;
  },

  updateSettings: async (patch) => {
    let next = { ...get().settings, ...patch };
    // Switching units resets unit-specific defaults to the sensible value for that unit.
    if (patch.unit && patch.unit !== get().settings.unit) {
      next = patch.unit === 'lb'
        ? { ...next, weightIncrementKg: lbToKg(5), barWeightKg: lbToKg(45) }
        : { ...next, weightIncrementKg: 2.5, barWeightKg: 20 };
    }
    set({ settings: next });
    await repo.saveSettings(next);
  },

  setMeta: async (patch) => {
    set((s) => ({ meta: { ...s.meta, ...patch } }));
    await Promise.all(Object.entries(patch).map(([k, v]) => repo.setMeta(k as repo.MetaKey, v)));
  },

  importBackup: async (b, mode) => {
    if (mode === 'replace') {
      await repo.replaceAllData(b);
      if (b.settings) await repo.saveSettings({ ...DEFAULT_SETTINGS, ...b.settings });
      await get().init();
      return { added: b.workouts.length + b.templates.length + b.exercises.length, skipped: 0 };
    }
    const s = get();
    const activeRow = s.active ? [s.active] : [];
    const ex = mergeById(s.exercises, b.exercises);
    const wo = mergeById([...s.workouts, ...activeRow], b.workouts);
    const tp = mergeById(s.templates, b.templates);
    await repo.bulkAddMissing({
      exercises: ex.items.slice(s.exercises.length),
      workouts: wo.items.slice(s.workouts.length + activeRow.length),
      templates: tp.items.slice(s.templates.length),
    });
    await get().init();
    return { added: ex.added + wo.added + tp.added, skipped: ex.skipped + wo.skipped + tp.skipped };
  },

  resetAll: async () => {
    await repo.resetAllData();
    await get().init();
  },
}));
