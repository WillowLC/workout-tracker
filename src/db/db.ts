import Dexie, { type Table } from 'dexie';
import type { Exercise, Gym, PersonalRecord, Template, Workout } from '../domain/types';
import { buildPRHistory } from '../domain/prs';
import { migrateSettings } from '../domain/weightSteps';
import { backfillSeedTags } from './seed';

export interface MetaRow {
  key: string;
  value: unknown;
}

export const DB_NAME = 'jim';

/**
 * Schema history. NEVER edit an existing version — add a new one with an
 * upgrade function. Dexie keeps all rows across versions; upgrades only
 * transform them. See db.migration.test.ts.
 *
 * v1: initial tables.
 * v2: index workouts.finishedAt and templates.folder; normalise legacy rows
 *     (sets get an explicit type/completed flag, exercises get archived=false).
 * v3: gyms and personalRecords tables; built-in exercises get muscle tags;
 *     settings move to per-equipment weight steps; PR history is rebuilt
 *     from existing workouts.
 */
export class JimDB extends Dexie {
  exercises!: Table<Exercise, string>;
  workouts!: Table<Workout, string>;
  templates!: Table<Template, string>;
  meta!: Table<MetaRow, string>;
  gyms!: Table<Gym, string>;
  personalRecords!: Table<PersonalRecord, string>;

  constructor(name = DB_NAME) {
    super(name);
    this.version(1).stores({
      exercises: 'id, name, bodyPart, equipment',
      workouts: 'id, startedAt',
      templates: 'id, name',
      meta: 'key',
    });
    this.version(2)
      .stores({
        exercises: 'id, name, bodyPart, equipment',
        workouts: 'id, startedAt, finishedAt',
        templates: 'id, name, folder',
        meta: 'key',
      })
      .upgrade(async (tx) => {
        await tx.table('workouts').toCollection().modify((w: Workout) => {
          for (const we of w.exercises ?? []) {
            for (const s of we.sets ?? []) {
              s.type ??= 'normal';
              s.completed = !!s.completed;
            }
          }
        });
        await tx.table('exercises').toCollection().modify((e: Exercise) => {
          e.archived ??= false;
        });
      });
    this.version(3)
      .stores({
        exercises: 'id, name, bodyPart, equipment',
        workouts: 'id, startedAt, finishedAt',
        templates: 'id, name, folder',
        meta: 'key',
        gyms: 'id, name',
        personalRecords: 'id, exerciseId, workoutId, date',
      })
      .upgrade(async (tx) => {
        // Built-in exercises get their muscle tags; custom ones stay untagged (the app asks once).
        await tx.table('exercises').toCollection().modify((e: Exercise) => {
          const tagged = backfillSeedTags(e);
          if (tagged) Object.assign(e, tagged);
        });
        // The single weight increment becomes per-equipment steps, plus the new settings.
        const row = await tx.table('meta').get('settings');
        const settings = migrateSettings(row?.value);
        if (row) await tx.table('meta').put({ key: 'settings', value: settings });
        // Existing workouts keep no gym. The PR history is rebuilt by replaying them in date order.
        const exercises: Exercise[] = await tx.table('exercises').toArray();
        const workouts: Workout[] = await tx.table('workouts').toArray();
        const tracking = new Map(exercises.map((e) => [e.id, e.trackingType]));
        const prs: PersonalRecord[] = buildPRHistory(workouts, (id) => tracking.get(id), settings.countWarmupsInStats);
        await tx.table('personalRecords').bulkPut(prs);
      });
  }
}

export const CURRENT_DB_VERSION = 3;
