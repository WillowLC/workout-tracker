import { describe, expect, it } from 'vitest';
import { filterExercises, matchScore } from './search';
import { platesPerSide, PLATES_KG } from './plates';
import { validateBackup, mergeById, shouldRemindBackup, makeBackup } from './backup';
import { workoutMatchesTemplate, templateFromWorkout } from './templates';
import { workoutFromTemplate, addSet, finalizeWorkout, replaceExercise } from './workoutOps';
import { SEED_EXERCISES } from '../db/seed';
import type { Template } from './types';

describe('seed library', () => {
  it('has 120+ uniquely-identified exercises with Strong naming', () => {
    expect(SEED_EXERCISES.length).toBeGreaterThanOrEqual(120);
    expect(new Set(SEED_EXERCISES.map((e) => e.id)).size).toBe(SEED_EXERCISES.length);
    const byName = Object.fromEntries(SEED_EXERCISES.map((e) => [e.name, e]));
    expect(byName['Bench Press (Barbell)']).toMatchObject({ bodyPart: 'Chest', equipment: 'Barbell', trackingType: 'weight_reps' });
    expect(byName['Pull Up (Assisted)']).toMatchObject({ trackingType: 'assisted_bodyweight', equipment: 'Assisted' });
    expect(byName['Plank'].trackingType).toBe('duration');
    expect(byName['Running'].trackingType).toBe('distance_duration');
  });
});

describe('search', () => {
  it('case-insensitive, words in any order, fuzzy', () => {
    expect(matchScore('barbell bench', 'Bench Press (Barbell)')).toBeGreaterThan(0);
    expect(matchScore('BENCH', 'Bench Press (Barbell)')).toBeGreaterThan(0);
    expect(matchScore('bnch', 'Bench Press (Barbell)')).toBeGreaterThan(0);
    expect(matchScore('squat', 'Bench Press (Barbell)')).toBe(0);
  });
  it('filters by body part and equipment', () => {
    const r = filterExercises(SEED_EXERCISES, { query: 'press', bodyParts: ['Chest'], equipment: ['Dumbbell'] });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((e) => e.bodyPart === 'Chest' && e.equipment === 'Dumbbell')).toBe(true);
  });
});

describe('plate calculator', () => {
  it('computes plates per side', () => {
    expect(platesPerSide(100, 20, PLATES_KG)).toEqual({ perSide: [25, 15], remainder: 0 });
    expect(platesPerSide(61, 20, PLATES_KG).remainder).toBeCloseTo(0.5);
    expect(platesPerSide(20, 20, PLATES_KG).perSide).toEqual([]);
  });
});

describe('backup', () => {
  it('validates shape', () => {
    expect(validateBackup({}).ok).toBe(false);
    expect(validateBackup(makeBackup({ exercises: [], workouts: [], templates: [] }, 1)).ok).toBe(true);
    expect(validateBackup({ ...makeBackup({ exercises: [], workouts: [{ id: 'x' } as never], templates: [] }, 1) }).ok).toBe(false);
  });
  it('merge skips duplicate IDs', () => {
    const r = mergeById([{ id: 'a', v: 1 }], [{ id: 'a', v: 2 }, { id: 'b', v: 3 }]);
    expect(r.items).toEqual([{ id: 'a', v: 1 }, { id: 'b', v: 3 }]);
    expect(r).toMatchObject({ added: 1, skipped: 1 });
  });
  it('reminds after 14 days, snoozes for 7', () => {
    const DAY = 86_400_000;
    expect(shouldRemindBackup({ workoutCount: 0, now: 0 })).toBe(false);
    expect(shouldRemindBackup({ workoutCount: 1, now: 100 * DAY })).toBe(true);
    expect(shouldRemindBackup({ workoutCount: 1, lastBackupAt: 90 * DAY, now: 100 * DAY })).toBe(false);
    expect(shouldRemindBackup({ workoutCount: 1, lastBackupAt: 80 * DAY, now: 100 * DAY, snoozedUntil: 101 * DAY })).toBe(false);
  });
});

describe('templates & workout ops', () => {
  const tpl: Template = {
    id: 't', name: 'Push',
    exercises: [
      { exerciseId: 'bench', order: 0, supersetGroupId: 'g', sets: [{ type: 'warmup' }, { type: 'normal', targetReps: 8 }] },
      { exerciseId: 'row', order: 1, supersetGroupId: 'g', sets: [{ type: 'normal' }] },
    ],
  };
  it('starting a template keeps structure (types, supersets) with empty values', () => {
    const w = workoutFromTemplate(tpl, 1);
    expect(w.templateId).toBe('t');
    expect(w.exercises[0].sets.map((s) => s.type)).toEqual(['warmup', 'normal']);
    expect(w.exercises[0].sets[0].weight).toBeUndefined();
    expect(w.exercises[0].supersetGroupId).toBe(w.exercises[1].supersetGroupId);
    expect(workoutMatchesTemplate(w, tpl)).toBe(true);
    expect(workoutMatchesTemplate(addSet(w, w.exercises[1].id), tpl)).toBe(false);
  });
  it('template from workout keeps target reps', () => {
    const w = workoutFromTemplate(tpl, 1);
    expect(templateFromWorkout(w, 'Push', tpl).exercises[0].sets[1].targetReps).toBe(8);
  });
  it('add set copies the last set values', () => {
    let w = workoutFromTemplate(tpl, 1);
    const weId = w.exercises[1].id;
    w = { ...w, exercises: w.exercises.map((e) => (e.id === weId ? { ...e, sets: [{ ...e.sets[0], weight: 60, reps: 10 }] } : e)) };
    const s = addSet(w, weId).exercises.find((e) => e.id === weId)!.sets[1];
    expect(s).toMatchObject({ weight: 60, reps: 10, completed: false, type: 'normal' });
  });
  it('replace exercise keeps set structure, resets values', () => {
    const w = workoutFromTemplate(tpl, 1);
    const r = replaceExercise(w, w.exercises[0].id, 'incline');
    expect(r.exercises[0]).toMatchObject({ exerciseId: 'incline' });
    expect(r.exercises[0].sets.map((s) => s.type)).toEqual(['warmup', 'normal']);
  });
  it('finish: complete or discard pending sets, drop empty exercises', () => {
    let w = workoutFromTemplate(tpl, 1);
    w = { ...w, exercises: w.exercises.map((e, i) => (i === 0 ? { ...e, sets: [{ ...e.sets[0], weight: 40, reps: 10 }, e.sets[1]] } : e)) };
    const t = () => 'weight_reps' as const;
    const done = finalizeWorkout(w, 'complete', t, () => undefined, 99);
    expect(done.finishedAt).toBe(99);
    expect(done.exercises.length).toBe(1);
    expect(done.exercises[0].sets.length).toBe(1);
    expect(finalizeWorkout(w, 'discard', t, () => undefined, 99).exercises.length).toBe(0);
  });
});
