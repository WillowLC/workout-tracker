import { describe, expect, it } from 'vitest';
import { SEED_EXERCISES, backfillSeedTags } from './seed';
import { SEED_MUSCLES } from './seedMuscles';
import { MUSCLES } from '../domain/types';

describe('seed muscle tags', () => {
  it('every built-in exercise has at least one primary muscle', () => {
    const missing = SEED_EXERCISES.filter((e) => !e.primaryMuscles?.length).map((e) => e.name);
    expect(missing).toEqual([]);
  });
  it('tags only use known muscles and every entry matches an exercise', () => {
    const names = new Set(SEED_EXERCISES.map((e) => e.name));
    for (const [name, spec] of Object.entries(SEED_MUSCLES)) {
      expect(names.has(name), name).toBe(true);
      for (const m of spec.split(/[|,]/).map((x) => x.trim()).filter(Boolean)) expect(MUSCLES, `${name}: ${m}`).toContain(m);
    }
  });
  it('examples from the brief', () => {
    const by = (n: string) => SEED_EXERCISES.find((e) => e.name === n)!;
    expect(by('Bench Press (Barbell)')).toMatchObject({ primaryMuscles: ['chest'], secondaryMuscles: ['front_delts', 'triceps'] });
    expect(by('Romanian Deadlift (Barbell)')).toMatchObject({ primaryMuscles: ['hamstrings', 'glutes'], secondaryMuscles: ['lower_back'] });
  });
  it('backfill tags old built-in rows only', () => {
    const { primaryMuscles: _p, secondaryMuscles: _s, ...old } = SEED_EXERCISES[0];
    expect(backfillSeedTags(old)?.primaryMuscles).toEqual(SEED_EXERCISES[0].primaryMuscles);
    expect(backfillSeedTags(SEED_EXERCISES[0])).toBeUndefined();
    expect(backfillSeedTags({ ...old, id: 'custom', isCustom: true })).toBeUndefined();
  });
});
