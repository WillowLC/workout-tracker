// Application data store. Holds everything in memory (the data set is small)
// and writes through to IndexedDB on every change via src/db/repo.ts.
import { create } from 'zustand';
import type { Exercise, FolderInfo, Gym, PersonalRecord, Settings, Template, Workout } from '../domain/types';
import { DEFAULT_SETTINGS } from '../domain/types';
import * as repo from '../db/repo';
import { buildPRHistory, workoutPRRecords } from '../domain/prs';
import { defaultWeightSteps, migrateSettings } from '../domain/weightSteps';
import { generateDemoData } from '../domain/demo';
import { PLATEAU_SNOOZE_DAYS } from '../domain/plateau';
import { DAY_MS } from '../domain/muscles';
import { createEmptyWorkout, repeatWorkout, workoutFromTemplate } from '../domain/workoutOps';
import { mergeById, type Backup } from '../domain/backup';
import { newId } from '../domain/ids';
import { lbToKg } from '../domain/units';
import { RECENT_COMPARISONS_KEPT } from '../domain/volumeComparison';
import { renameFolderInfo } from '../domain/templates';
import { drawInspiration } from '../domain/inspiration';

export interface AppMeta {
  lastBackupAt?: number;
  backupSnoozedUntil?: number;
  persistGranted?: boolean | null; // null = API unsupported
  installHintDismissed?: boolean;
  /** Remaining shuffle bag of post-workout quote/fact indices. */
  inspirationDeck?: number[];
  lastInspiration?: number;
  /** Plateau alerts dismissed until (ms), by exercise id. */
  plateauSnoozes?: Record<string, number>;
  /** Dismissed home-dashboard recap cards (DueRecap.dismissKey). */
  dismissedRecaps?: string[];
  /** Volume comparison ids used most recently (oldest first), to avoid repeats. */
  recentComparisons?: string[];
  /** The one-time "Tag your custom exercises" prompt was dismissed. */
  tagPromptDismissed?: boolean;
}

interface AppState {
  ready: boolean;
  exercises: Exercise[];
  /** Finished workouts only. */
  workouts: Workout[];
  templates: Template[];
  /** Folder order and weekly plans. */
  folders: FolderInfo[];
  settings: Settings;
  active: Workout | null;
  meta: AppMeta;
  gyms: Gym[];
  /** One row per PR ever set (derived from history; see domain/prs.ts). */
  personalRecords: PersonalRecord[];

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
  /** Save several templates at once (e.g. after reordering). */
  saveTemplates: (ts: Template[]) => Promise<void>;
  saveFolders: (folders: FolderInfo[]) => Promise<void>;
  renameFolder: (from: string, to: string) => Promise<void>;

  // Exercises
  saveExercise: (e: Exercise) => Promise<void>;
  saveExercises: (es: Exercise[]) => Promise<void>;
  createExercise: (e: Omit<Exercise, 'id' | 'isCustom'>) => Promise<Exercise>;

  // Gyms
  saveGym: (g: Gym) => Promise<void>;
  /** Deletes the gym; its workouts are kept and become gym-less. */
  deleteGym: (id: string) => Promise<void>;
  setCurrentGym: (id: string | undefined) => Promise<void>;

  // Progress
  rebuildPRs: () => Promise<void>;
  snoozePlateau: (exerciseId: string) => Promise<void>;
  dismissRecap: (key: string) => Promise<void>;
  /** Remember a volume comparison as used (keeps the last few). */
  noteComparison: (id: string) => Promise<void>;

  // Settings & meta
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  setMeta: (patch: AppMeta) => Promise<void>;
  /** Pick the next post-workout quote/fact (no repeats until all are shown). */
  nextInspiration: () => number;

  // Data
  importBackup: (b: Backup, mode: 'replace' | 'merge') => Promise<{ added: number; skipped: number }>;
  resetAll: () => Promise<void>;
  loadDemoData: () => Promise<number>;
  clearDemoData: () => Promise<number>;
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  exercises: [],
  workouts: [],
  templates: [],
  folders: [],
  settings: DEFAULT_SETTINGS,
  active: null,
  meta: {},
  gyms: [],
  personalRecords: [],

  init: async () => {
    const data = await repo.loadAll();
    const [lastBackupAt, backupSnoozedUntil, persistGranted, installHintDismissed, folders, inspirationDeck, lastInspiration, plateauSnoozes, dismissedRecaps, recentComparisons, tagPromptDismissed] = await Promise.all([
      repo.getMeta<number>('lastBackupAt'),
      repo.getMeta<number>('backupSnoozedUntil'),
      repo.getMeta<boolean | null>('persistGranted'),
      repo.getMeta<boolean>('installHintDismissed'),
      repo.getMeta<FolderInfo[]>('folders'),
      repo.getMeta<number[]>('inspirationDeck'),
      repo.getMeta<number>('lastInspiration'),
      repo.getMeta<Record<string, number>>('plateauSnoozes'),
      repo.getMeta<string[]>('dismissedRecaps'),
      repo.getMeta<string[]>('recentComparisons'),
      repo.getMeta<boolean>('tagPromptDismissed'),
    ]);
    const active = data.workouts.find((w) => w.finishedAt === undefined) ?? null;
    set({
      ready: true,
      exercises: data.exercises,
      workouts: data.workouts.filter((w) => w.finishedAt !== undefined),
      templates: data.templates,
      folders: folders ?? [],
      settings: data.settings,
      active,
      gyms: data.gyms,
      personalRecords: data.personalRecords,
      meta: { lastBackupAt, backupSnoozedUntil, persistGranted, installHintDismissed, inspirationDeck, lastInspiration, plateauSnoozes, dismissedRecaps, recentComparisons, tagPromptDismissed },
    });
  },

  startWorkout: (from) => {
    const now = Date.now();
    const base = from?.template ? workoutFromTemplate(from.template, now) : from?.repeat ? repeatWorkout(from.repeat, now) : createEmptyWorkout(now);
    const { currentGymId } = get().settings;
    const w = currentGymId && get().gyms.some((g) => g.id === currentGymId) ? { ...base, gymId: currentGymId } : base;
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
    const s = get();
    const trackingOf = (id: string) => s.exercises.find((e) => e.id === id)?.trackingType;
    const prs = workoutPRRecords(finished, s.workouts, trackingOf, s.settings.countWarmupsInStats);
    set((st) => ({
      active: null,
      workouts: [...st.workouts.filter((w) => w.id !== finished.id), finished],
      personalRecords: [...st.personalRecords.filter((p) => p.workoutId !== finished.id), ...prs],
    }));
    await repo.putWorkout(finished);
    await repo.addPersonalRecords(prs);
    // A workout finished "in the past" (older than others) changes later records too.
    if (s.workouts.some((w) => w.startedAt > finished.startedAt)) await get().rebuildPRs();
  },

  cancelActive: async () => {
    const cur = get().active;
    set({ active: null });
    if (cur) await repo.deleteWorkoutRow(cur.id);
  },

  saveWorkout: async (w) => {
    set((s) => ({ workouts: [...s.workouts.filter((x) => x.id !== w.id), w] }));
    await repo.putWorkout(w);
    await get().rebuildPRs();
  },

  deleteWorkout: async (id) => {
    const w = get().workouts.find((x) => x.id === id);
    set((s) => ({ workouts: s.workouts.filter((x) => x.id !== id) }));
    await repo.deleteWorkoutRow(id);
    await get().rebuildPRs();
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

  saveTemplates: async (ts) => {
    if (!ts.length) return;
    const ids = new Set(ts.map((t) => t.id));
    set((s) => ({ templates: [...s.templates.filter((x) => !ids.has(x.id)), ...ts] }));
    await repo.putTemplates(ts);
  },

  saveFolders: async (folders) => {
    set({ folders });
    await repo.setMeta('folders', folders);
  },

  renameFolder: async (from, to) => {
    const moved = get().templates.filter((t) => t.folder === from).map((t) => ({ ...t, folder: to }));
    await get().saveTemplates(moved);
    await get().saveFolders(renameFolderInfo(get().folders, from, to));
  },

  saveExercise: async (e) => {
    const before = get().exercises.find((x) => x.id === e.id);
    set((s) => ({ exercises: [...s.exercises.filter((x) => x.id !== e.id), e] }));
    await repo.putExercise(e);
    if (before && before.trackingType !== e.trackingType) await get().rebuildPRs();
  },

  saveExercises: async (es) => {
    if (!es.length) return;
    const ids = new Set(es.map((e) => e.id));
    set((s) => ({ exercises: [...s.exercises.filter((x) => !ids.has(x.id)), ...es] }));
    await repo.putExercises(es);
  },

  saveGym: async (g) => {
    set((s) => ({ gyms: [...s.gyms.filter((x) => x.id !== g.id), g] }));
    await repo.putGym(g);
  },

  deleteGym: async (id) => {
    const s = get();
    const orphaned = s.workouts.filter((w) => w.gymId === id).map((w) => ({ ...w, gymId: undefined }));
    const active = s.active?.gymId === id ? { ...s.active, gymId: undefined } : s.active;
    const ids = new Set(orphaned.map((w) => w.id));
    set({ gyms: s.gyms.filter((g) => g.id !== id), workouts: s.workouts.map((w) => (ids.has(w.id) ? orphaned.find((o) => o.id === w.id)! : w)), active });
    await repo.deleteGymRows([id]);
    await repo.putWorkouts(active && active !== s.active ? [...orphaned, active] : orphaned);
    if (s.settings.currentGymId === id) await get().updateSettings({ currentGymId: undefined });
  },

  setCurrentGym: async (id) => {
    await get().updateSettings({ currentGymId: id });
  },

  rebuildPRs: async () => {
    const s = get();
    const tracking = new Map(s.exercises.map((e) => [e.id, e.trackingType]));
    const rows = buildPRHistory(s.workouts, (id) => tracking.get(id), s.settings.countWarmupsInStats);
    set({ personalRecords: rows });
    await repo.replacePersonalRecords(rows);
  },

  snoozePlateau: async (exerciseId) => {
    const snoozes = { ...get().meta.plateauSnoozes, [exerciseId]: Date.now() + PLATEAU_SNOOZE_DAYS * DAY_MS };
    await get().setMeta({ plateauSnoozes: snoozes });
  },

  dismissRecap: async (key) => {
    await get().setMeta({ dismissedRecaps: [...(get().meta.dismissedRecaps ?? []).slice(-50), key] });
  },

  noteComparison: async (id) => {
    await get().setMeta({ recentComparisons: [...(get().meta.recentComparisons ?? []), id].slice(-RECENT_COMPARISONS_KEPT) });
  },

  createExercise: async (e) => {
    const ex: Exercise = { ...e, id: newId(), isCustom: true };
    await get().saveExercise(ex);
    return ex;
  },

  updateSettings: async (patch) => {
    const prev = get().settings;
    let next = { ...prev, ...patch };
    // Switching units resets unit-specific defaults to the sensible value for that unit.
    if (patch.unit && patch.unit !== prev.unit) {
      next = { ...next, weightStepsKg: defaultWeightSteps(patch.unit), barWeightKg: patch.unit === 'lb' ? lbToKg(45) : 20 };
    }
    set({ settings: next });
    await repo.saveSettings(next);
    if (patch.countWarmupsInStats !== undefined && patch.countWarmupsInStats !== prev.countWarmupsInStats) await get().rebuildPRs();
  },

  setMeta: async (patch) => {
    set((s) => ({ meta: { ...s.meta, ...patch } }));
    await Promise.all(Object.entries(patch).map(([k, v]) => repo.setMeta(k as repo.MetaKey, v)));
  },

  nextInspiration: () => {
    const { inspirationDeck, lastInspiration } = get().meta;
    const { index, deck } = drawInspiration(inspirationDeck, lastInspiration);
    void get().setMeta({ inspirationDeck: deck, lastInspiration: index });
    return index;
  },

  importBackup: async (b, mode) => {
    if (mode === 'replace') {
      await repo.replaceAllData(b);
      if (b.settings) await repo.saveSettings(migrateSettings({ ...DEFAULT_SETTINGS, ...b.settings }));
      await repo.setMeta('folders', b.folders ?? []);
      await get().init();
      await get().rebuildPRs();
      return { added: b.workouts.length + b.templates.length + b.exercises.length, skipped: 0 };
    }
    const s = get();
    const activeRow = s.active ? [s.active] : [];
    const ex = mergeById(s.exercises, b.exercises);
    const wo = mergeById([...s.workouts, ...activeRow], b.workouts);
    const tp = mergeById(s.templates, b.templates);
    const gy = mergeById(s.gyms, b.gyms ?? []);
    const newFolders = (b.folders ?? []).filter((f) => !s.folders.some((x) => x.name === f.name));
    if (newFolders.length) await repo.setMeta('folders', [...s.folders, ...newFolders]);
    await repo.bulkAddMissing({
      exercises: ex.items.slice(s.exercises.length),
      workouts: wo.items.slice(s.workouts.length + activeRow.length),
      templates: tp.items.slice(s.templates.length),
      gyms: gy.items.slice(s.gyms.length),
    });
    await get().init();
    await get().rebuildPRs();
    return { added: ex.added + wo.added + tp.added, skipped: ex.skipped + wo.skipped + tp.skipped };
  },

  resetAll: async () => {
    await repo.resetAllData();
    await get().init();
  },

  loadDemoData: async () => {
    await get().clearDemoData();
    const { gyms, workouts } = generateDemoData(Date.now(), newId);
    await repo.putGyms(gyms);
    await repo.putWorkouts(workouts);
    set((s) => ({ gyms: [...s.gyms, ...gyms], workouts: [...s.workouts, ...workouts] }));
    if (!get().settings.currentGymId) await get().updateSettings({ currentGymId: gyms[0].id });
    await get().rebuildPRs();
    return workouts.length;
  },

  clearDemoData: async () => {
    const s = get();
    const demoGyms = new Set(s.gyms.filter((g) => g.demo).map((g) => g.id));
    const demoWorkouts = s.workouts.filter((w) => w.demo).map((w) => w.id);
    if (!demoGyms.size && !demoWorkouts.length) return 0;
    // Real workouts that were tagged with a demo gym just lose the gym.
    const retagged = s.workouts.filter((w) => !w.demo && w.gymId && demoGyms.has(w.gymId)).map((w) => ({ ...w, gymId: undefined }));
    const active = s.active?.gymId && demoGyms.has(s.active.gymId) ? { ...s.active, gymId: undefined } : s.active;
    const drop = new Set(demoWorkouts);
    set({
      gyms: s.gyms.filter((g) => !demoGyms.has(g.id)),
      workouts: s.workouts.filter((w) => !drop.has(w.id)).map((w) => retagged.find((r) => r.id === w.id) ?? w),
      active,
    });
    await repo.deleteWorkoutRows(demoWorkouts);
    await repo.deleteGymRows([...demoGyms]);
    await repo.putWorkouts(active && active !== s.active ? [...retagged, active] : retagged);
    if (s.settings.currentGymId && demoGyms.has(s.settings.currentGymId)) await get().updateSettings({ currentGymId: undefined });
    await get().rebuildPRs();
    return demoWorkouts.length;
  },
}));
