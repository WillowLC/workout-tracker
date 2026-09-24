import type { Exercise, Settings, Template, Workout } from './types';

export const BACKUP_FORMAT = 'jim-backup';
export const BACKUP_VERSION = 1;

export interface Backup {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: number;
  appVersion?: string;
  exercises: Exercise[];
  workouts: Workout[];
  templates: Template[];
  settings?: Settings;
}

export function makeBackup(data: Omit<Backup, 'format' | 'version' | 'exportedAt'>, now: number): Backup {
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: now, ...data };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export type ValidationResult = { ok: true; backup: Backup } | { ok: false; error: string };

/** Validate an untrusted parsed JSON value as a backup file. */
export function validateBackup(raw: unknown): ValidationResult {
  if (!isObj(raw)) return { ok: false, error: 'Not a JSON object.' };
  if (raw.format !== BACKUP_FORMAT) return { ok: false, error: 'This is not a Jim backup file.' };
  if (!isNum(raw.version) || raw.version > BACKUP_VERSION) return { ok: false, error: 'Backup was made by a newer version of the app.' };
  for (const k of ['exercises', 'workouts', 'templates'] as const) {
    if (!Array.isArray(raw[k])) return { ok: false, error: `Missing "${k}" list.` };
  }
  const exercises = raw.exercises as unknown[];
  const workouts = raw.workouts as unknown[];
  const templates = raw.templates as unknown[];
  for (const [i, e] of exercises.entries()) {
    if (!isObj(e) || !isStr(e.id) || !isStr(e.name) || !isStr(e.trackingType)) return { ok: false, error: `Exercise #${i + 1} is invalid.` };
  }
  for (const [i, w] of workouts.entries()) {
    if (!isObj(w) || !isStr(w.id) || !isNum(w.startedAt) || !Array.isArray(w.exercises)) return { ok: false, error: `Workout #${i + 1} is invalid.` };
    for (const we of w.exercises as unknown[]) {
      if (!isObj(we) || !isStr(we.id) || !isStr(we.exerciseId) || !Array.isArray(we.sets)) return { ok: false, error: `Workout #${i + 1} has an invalid exercise.` };
      for (const s of we.sets as unknown[]) if (!isObj(s) || !isStr(s.id)) return { ok: false, error: `Workout #${i + 1} has an invalid set.` };
    }
  }
  for (const [i, t] of templates.entries()) {
    if (!isObj(t) || !isStr(t.id) || !Array.isArray(t.exercises)) return { ok: false, error: `Template #${i + 1} is invalid.` };
  }
  return { ok: true, backup: raw as unknown as Backup };
}

export interface MergeResult<T> {
  items: T[];
  added: number;
  skipped: number;
}

/** Merge: keep existing rows, add incoming rows whose ID doesn't exist yet. */
export function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): MergeResult<T> {
  const ids = new Set(existing.map((e) => e.id));
  const add = incoming.filter((i) => !ids.has(i.id));
  return { items: [...existing, ...add], added: add.length, skipped: incoming.length - add.length };
}

export function backupSummary(b: Backup) {
  return {
    workouts: b.workouts.filter((w) => w.finishedAt).length,
    exercises: b.exercises.length,
    customExercises: b.exercises.filter((e) => e.isCustom).length,
    templates: b.templates.length,
  };
}

/** Show the backup reminder? Workouts exist and last export > 14 days ago (or never), not snoozed. */
export function shouldRemindBackup(opts: { workoutCount: number; lastBackupAt?: number; snoozedUntil?: number; now: number }): boolean {
  const DAY = 86_400_000;
  if (opts.workoutCount === 0) return false;
  if (opts.snoozedUntil && opts.now < opts.snoozedUntil) return false;
  return !opts.lastBackupAt || opts.now - opts.lastBackupAt > 14 * DAY;
}
