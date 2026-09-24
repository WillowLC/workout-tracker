// Thin persistence layer over Dexie. All reads/writes of user data go through here.
import type { Exercise, Settings, Template, Workout } from '../domain/types';
import { DEFAULT_SETTINGS } from '../domain/types';
import { JimDB } from './db';
import { SEED_EXERCISES } from './seed';

export const db = new JimDB();

export type MetaKey =
  | 'settings'
  | 'lastBackupAt'
  | 'backupSnoozedUntil'
  | 'persistGranted'
  | 'installHintDismissed';

export async function getMeta<T>(key: MetaKey): Promise<T | undefined> {
  return (await db.meta.get(key))?.value as T | undefined;
}

export async function setMeta(key: MetaKey, value: unknown): Promise<void> {
  await db.meta.put({ key, value });
}

/** Adds any seeded exercises that are missing (first launch, or new ones in an update). Never overwrites. */
export async function seedIfNeeded(database: JimDB = db): Promise<number> {
  const existing = new Set(await database.exercises.toCollection().primaryKeys());
  const missing = SEED_EXERCISES.filter((e) => !existing.has(e.id));
  if (missing.length) await database.exercises.bulkAdd(missing);
  return missing.length;
}

export interface LoadedData {
  exercises: Exercise[];
  workouts: Workout[];
  templates: Template[];
  settings: Settings;
}

export async function loadAll(): Promise<LoadedData> {
  await seedIfNeeded();
  const [exercises, workouts, templates, settings] = await Promise.all([
    db.exercises.toArray(),
    db.workouts.toArray(),
    db.templates.toArray(),
    getMeta<Partial<Settings>>('settings'),
  ]);
  return { exercises, workouts, templates, settings: { ...DEFAULT_SETTINGS, ...settings } };
}

export const putWorkout = (w: Workout) => db.workouts.put(w);
export const deleteWorkoutRow = (id: string) => db.workouts.delete(id);
export const putTemplate = (t: Template) => db.templates.put(t);
export const deleteTemplateRow = (id: string) => db.templates.delete(id);
export const putExercise = (e: Exercise) => db.exercises.put(e);
export const saveSettings = (s: Settings) => setMeta('settings', s);

export async function replaceAllData(data: { exercises: Exercise[]; workouts: Workout[]; templates: Template[] }) {
  await db.transaction('rw', db.exercises, db.workouts, db.templates, async () => {
    await Promise.all([db.exercises.clear(), db.workouts.clear(), db.templates.clear()]);
    await db.exercises.bulkPut(data.exercises);
    await db.workouts.bulkPut(data.workouts);
    await db.templates.bulkPut(data.templates);
  });
  await seedIfNeeded();
}

export async function bulkAddMissing(data: { exercises: Exercise[]; workouts: Workout[]; templates: Template[] }) {
  await db.transaction('rw', db.exercises, db.workouts, db.templates, async () => {
    await db.exercises.bulkPut(data.exercises);
    await db.workouts.bulkPut(data.workouts);
    await db.templates.bulkPut(data.templates);
  });
}

export async function resetAllData() {
  await db.transaction('rw', [db.exercises, db.workouts, db.templates, db.meta], async () => {
    await Promise.all([db.exercises.clear(), db.workouts.clear(), db.templates.clear(), db.meta.clear()]);
  });
  await seedIfNeeded();
}
