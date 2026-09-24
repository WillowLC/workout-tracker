import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import { CURRENT_DB_VERSION, JimDB } from './db';
import { seedIfNeeded } from './repo';

describe('Dexie migrations', () => {
  it('upgrades a v1 database to the current schema without losing data', async () => {
    const name = 'jim-migration-test';
    // Create a database exactly as v1 of the app did, with legacy-shaped rows.
    const v1 = new Dexie(name);
    v1.version(1).stores({ exercises: 'id, name, bodyPart, equipment', workouts: 'id, startedAt', templates: 'id, name', meta: 'key' });
    await v1.open();
    await v1.table('exercises').bulkAdd([
      { id: 'custom-1', name: 'My Press', bodyPart: 'Chest', equipment: 'Machine', trackingType: 'weight_reps', isCustom: true, notes: 'seat 4' },
      { id: 'seed-bench-press-barbell', name: 'Bench Press (Barbell)', bodyPart: 'Chest', equipment: 'Barbell', trackingType: 'weight_reps', isCustom: false, notes: 'user note on seeded' },
    ]);
    await v1.table('workouts').bulkAdd([
      {
        id: 'w1', name: 'Push', startedAt: 1, finishedAt: 2,
        exercises: [{ id: 'we1', exerciseId: 'custom-1', order: 0, sets: [{ id: 's1', weight: 50, reps: 10, completed: true }, { id: 's2', type: 'warmup', weight: 20, reps: 10 }] }],
      },
    ]);
    await v1.table('templates').add({ id: 't1', name: 'Push', exercises: [] });
    await v1.table('meta').add({ key: 'settings', value: { unit: 'lb' } });
    v1.close();

    const db = new JimDB(name);
    await db.open();
    expect(db.verno).toBe(CURRENT_DB_VERSION);

    const w = await db.workouts.get('w1');
    expect(w?.exercises[0].sets).toEqual([
      { id: 's1', type: 'normal', weight: 50, reps: 10, completed: true },
      { id: 's2', type: 'warmup', weight: 20, reps: 10, completed: false },
    ]);
    expect(await db.exercises.get('custom-1')).toMatchObject({ name: 'My Press', notes: 'seat 4', archived: false });
    expect(await db.templates.count()).toBe(1);
    expect((await db.meta.get('settings'))?.value).toEqual({ unit: 'lb' });
    // New indexes work.
    expect(await db.workouts.where('finishedAt').above(0).count()).toBe(1);

    // Seeding after an upgrade never overwrites existing rows.
    await seedIfNeeded(db);
    expect((await db.exercises.get('seed-bench-press-barbell'))?.notes).toBe('user note on seeded');
    expect(await db.exercises.count()).toBeGreaterThan(120);
    db.close();
  });
});
