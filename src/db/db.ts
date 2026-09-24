import Dexie, { type Table } from 'dexie';
import type { Exercise, Template, Workout } from '../domain/types';

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
 */
export class JimDB extends Dexie {
  exercises!: Table<Exercise, string>;
  workouts!: Table<Workout, string>;
  templates!: Table<Template, string>;
  meta!: Table<MetaRow, string>;

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
  }
}

export const CURRENT_DB_VERSION = 2;
