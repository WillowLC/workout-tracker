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
    expect((await db.meta.get('settings'))?.value).toMatchObject({ unit: 'lb' });
    // New indexes work.
    expect(await db.workouts.where('finishedAt').above(0).count()).toBe(1);

    // Seeding after an upgrade never overwrites existing rows.
    await seedIfNeeded(db);
    expect((await db.exercises.get('seed-bench-press-barbell'))?.notes).toBe('user note on seeded');
    expect(await db.exercises.count()).toBeGreaterThan(120);
    db.close();
  });

  it('upgrades a v2 database (the previous release) to v3 without losing data', async () => {
    const name = 'jim-migration-v2-test';
    const v2 = new Dexie(name);
    v2.version(2).stores({ exercises: 'id, name, bodyPart, equipment', workouts: 'id, startedAt, finishedAt', templates: 'id, name, folder', meta: 'key' });
    await v2.open();
    const bench = { id: 'seed-bench-press-barbell', name: 'Bench Press (Barbell)', bodyPart: 'Chest', equipment: 'Barbell', trackingType: 'weight_reps', isCustom: false, archived: false, notes: 'wide grip' };
    const custom = { id: 'c1', name: 'Hammer Strength Row', bodyPart: 'Back', equipment: 'Machine', trackingType: 'weight_reps', isCustom: true, archived: false };
    await v2.table('exercises').bulkAdd([bench, custom]);
    const s = (id: string, weight: number, reps: number, completedAt: number, type = 'normal') => ({ id, type, weight, reps, completed: true, completedAt });
    const workouts = [
      { id: 'w1', name: 'Push', startedAt: 1_000, finishedAt: 2_000, templateId: 't1', note: 'felt good', exercises: [
        { id: 'we1', exerciseId: bench.id, order: 0, sets: [s('a', 40, 10, 1, 'warmup'), s('b', 80, 8, 2), s('c', 80, 8, 3)] },
        { id: 'we2', exerciseId: 'c1', order: 1, supersetGroupId: 'g1', sessionNote: 'seat 4', sets: [s('d', 50, 12, 4)] },
      ] },
      { id: 'w2', name: 'Push', startedAt: 5_000, finishedAt: 6_000, exercises: [{ id: 'we3', exerciseId: bench.id, order: 0, sets: [s('e', 82.5, 6, 5), s('f', 85, 3, 6)] }] },
      // In-progress workout: no finishedAt.
      { id: 'w3', name: 'Now', startedAt: 9_000, exercises: [{ id: 'we4', exerciseId: bench.id, order: 0, sets: [{ id: 'g', type: 'normal', weight: 90, completed: false }] }] },
    ];
    await v2.table('workouts').bulkAdd(workouts);
    const template = { id: 't1', name: 'Push', folder: 'PPL', order: 0, exercises: [{ exerciseId: bench.id, order: 0, sets: [{ type: 'normal', targetReps: 8 }] }] };
    await v2.table('templates').add(template);
    await v2.table('meta').bulkAdd([
      { key: 'settings', value: { unit: 'kg', countWarmupsInStats: false, showRpe: true, weightIncrementKg: 1.25, barWeightKg: 20 } },
      { key: 'folders', value: [{ name: 'PPL', order: 0, plan: ['t1', null, null, null, null, null, null] }] },
      { key: 'lastBackupAt', value: 123 },
    ]);
    v2.close();

    const db = new JimDB(name);
    await db.open();
    expect(db.verno).toBe(CURRENT_DB_VERSION);

    // Every workout, set, template and meta row survives unchanged; workouts get no gym.
    expect(await db.workouts.toArray()).toEqual(workouts);
    expect((await db.workouts.toArray()).every((w) => w.gymId === undefined)).toBe(true);
    expect(await db.templates.get('t1')).toEqual(template);
    expect((await db.meta.get('folders'))?.value).toEqual([{ name: 'PPL', order: 0, plan: ['t1', null, null, null, null, null, null] }]);
    expect((await db.meta.get('lastBackupAt'))?.value).toBe(123);

    // Built-in exercises get muscle tags (notes kept); custom ones stay untagged.
    expect(await db.exercises.get(bench.id)).toMatchObject({ notes: 'wide grip', primaryMuscles: ['chest'], secondaryMuscles: ['front_delts', 'triceps'] });
    expect(await db.exercises.get('c1')).toEqual(custom);

    // The changed weight increment becomes the barbell step; other settings are kept.
    const settings = (await db.meta.get('settings'))?.value as Record<string, unknown>;
    expect(settings).toMatchObject({ showRpe: true, barWeightKg: 20, weightStepsKg: { Barbell: 1.25, 'Smith Machine': 1.25, Dumbbell: 2, Machine: 5 } });
    expect(settings.weightIncrementKg).toBeUndefined();

    // PR history is rebuilt from finished workouts in date order.
    const prs = await db.personalRecords.orderBy('date').toArray();
    expect(prs.every((p) => p.workoutId !== 'w3')).toBe(true);
    expect(prs.filter((p) => p.workoutId === 'w1').map((p) => `${p.exerciseId}:${p.kind}`).sort()).toEqual(['c1:weight', 'seed-bench-press-barbell:weight']);
    expect(prs.find((p) => p.workoutId === 'w2' && p.kind === 'weight')).toMatchObject({ value: 85, previous: 80, set: { weight: 85, reps: 3 } });
    expect(await db.gyms.count()).toBe(0);
    db.close();
  });
});
