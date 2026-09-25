// Thin persistence layer over Dexie. All reads/writes of user data go through here.
import type { Exercise, Gym, PersonalRecord, Settings, Template, Workout } from '../domain/types';
import { migrateSettings } from '../domain/weightSteps';
import { JimDB } from './db';
import { backfillSeedTags, SEED_EXERCISES } from './seed';

export const db = new JimDB();

export type MetaKey =
  | 'settings'
  | 'lastBackupAt'
  | 'backupSnoozedUntil'
  | 'persistGranted'
  | 'installHintDismissed'
  | 'folders'
  | 'inspirationDeck'
  | 'lastInspiration'
  | 'plateauSnoozes'
  | 'dismissedRecaps'
  | 'recentComparisons'
  | 'tagPromptDismissed';

export async function getMeta<T>(key: MetaKey): Promise<T | undefined> {
  return (await db.meta.get(key))?.value as T | undefined;
}

export async function setMeta(key: MetaKey, value: unknown): Promise<void> {
  await db.meta.put({ key, value });
}

/**
 * Adds any seeded exercises that are missing (first launch, or new ones in an
 * update), and gives stored built-in exercises muscle tags they predate.
 * Never overwrites anything the user set.
 */
export async function seedIfNeeded(database: JimDB = db): Promise<number> {
  const existing = await database.exercises.toArray();
  const ids = new Set(existing.map((e) => e.id));
  const missing = SEED_EXERCISES.filter((e) => !ids.has(e.id));
  if (missing.length) await database.exercises.bulkAdd(missing);
  const backfilled = existing.map(backfillSeedTags).filter((e): e is Exercise => !!e);
  if (backfilled.length) await database.exercises.bulkPut(backfilled);
  return missing.length;
}

export interface LoadedData {
  exercises: Exercise[];
  workouts: Workout[];
  templates: Template[];
  settings: Settings;
  gyms: Gym[];
  personalRecords: PersonalRecord[];
}

export async function loadAll(): Promise<LoadedData> {
  await seedIfNeeded();
  const [exercises, workouts, templates, settings, gyms, personalRecords] = await Promise.all([
    db.exercises.toArray(),
    db.workouts.toArray(),
    db.templates.toArray(),
    getMeta<unknown>('settings'),
    db.gyms.toArray(),
    db.personalRecords.toArray(),
  ]);
  return { exercises, workouts, templates, settings: migrateSettings(settings), gyms, personalRecords };
}

export const putWorkout = (w: Workout) => db.workouts.put(w);
export const putWorkouts = (ws: Workout[]) => db.workouts.bulkPut(ws);
export const deleteWorkoutRow = (id: string) => db.workouts.delete(id);
export const deleteWorkoutRows = (ids: string[]) => db.workouts.bulkDelete(ids);
export const putTemplate = (t: Template) => db.templates.put(t);
export const putTemplates = (ts: Template[]) => db.templates.bulkPut(ts);
export const deleteTemplateRow = (id: string) => db.templates.delete(id);
export const putExercise = (e: Exercise) => db.exercises.put(e);
export const putExercises = (es: Exercise[]) => db.exercises.bulkPut(es);
export const saveSettings = (s: Settings) => setMeta('settings', s);
export const putGym = (g: Gym) => db.gyms.put(g);
export const putGyms = (gs: Gym[]) => db.gyms.bulkPut(gs);
export const deleteGymRows = (ids: string[]) => db.gyms.bulkDelete(ids);
export const addPersonalRecords = (rows: PersonalRecord[]) => db.personalRecords.bulkPut(rows);

/** Replace the whole PR table (after history changed). */
export async function replacePersonalRecords(rows: PersonalRecord[]) {
  await db.transaction('rw', db.personalRecords, async () => {
    await db.personalRecords.clear();
    await db.personalRecords.bulkPut(rows);
  });
}

type Data = { exercises: Exercise[]; workouts: Workout[]; templates: Template[]; gyms?: Gym[] };

export async function replaceAllData(data: Data) {
  await db.transaction('rw', [db.exercises, db.workouts, db.templates, db.gyms], async () => {
    await Promise.all([db.exercises.clear(), db.workouts.clear(), db.templates.clear(), db.gyms.clear()]);
    await db.exercises.bulkPut(data.exercises);
    await db.workouts.bulkPut(data.workouts);
    await db.templates.bulkPut(data.templates);
    await db.gyms.bulkPut(data.gyms ?? []);
  });
  await seedIfNeeded();
}

export async function bulkAddMissing(data: Data) {
  await db.transaction('rw', [db.exercises, db.workouts, db.templates, db.gyms], async () => {
    await db.exercises.bulkPut(data.exercises);
    await db.workouts.bulkPut(data.workouts);
    await db.templates.bulkPut(data.templates);
    await db.gyms.bulkPut(data.gyms ?? []);
  });
}

export async function resetAllData() {
  await db.transaction('rw', [db.exercises, db.workouts, db.templates, db.meta, db.gyms, db.personalRecords], async () => {
    await Promise.all([db.exercises.clear(), db.workouts.clear(), db.templates.clear(), db.meta.clear(), db.gyms.clear(), db.personalRecords.clear()]);
  });
  await seedIfNeeded();
}
