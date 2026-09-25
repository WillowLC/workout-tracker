import { describe, expect, it } from 'vitest';
import { defaultRepRange, effectiveRepRange, exerciseRepRange, suggestProgression } from './progression';
import { set } from '../test/fixtures';
import type { Exercise, Template } from './types';

const ex = (name: string, equipment: Exercise['equipment'], trackingType: Exercise['trackingType'] = 'weight_reps', bodyPart: Exercise['bodyPart'] = 'Chest'): Exercise =>
  ({ id: name, name, equipment, trackingType, bodyPart, isCustom: false });

describe('default rep ranges', () => {
  it('big barbell compounds 5–8', () => {
    expect(defaultRepRange(ex('Bench Press (Barbell)', 'Barbell'))).toEqual({ min: 5, max: 8 });
    expect(defaultRepRange(ex('Squat (Barbell)', 'Barbell', 'weight_reps', 'Legs'))).toEqual({ min: 5, max: 8 });
    expect(defaultRepRange(ex('Romanian Deadlift (Barbell)', 'Barbell', 'weight_reps', 'Legs'))).toEqual({ min: 5, max: 8 });
  });
  it('other weighted 8–12', () => {
    expect(defaultRepRange(ex('Bench Press (Dumbbell)', 'Dumbbell'))).toEqual({ min: 8, max: 12 });
    expect(defaultRepRange(ex('Leg Press', 'Machine'))).toEqual({ min: 8, max: 12 });
    expect(defaultRepRange(ex('Chin Up (Weighted)', 'Bodyweight', 'weighted_bodyweight'))).toEqual({ min: 8, max: 12 });
  });
  it('isolation, cable and lateral raises 10–15', () => {
    expect(defaultRepRange(ex('Lateral Raise (Dumbbell)', 'Dumbbell'))).toEqual({ min: 10, max: 15 });
    expect(defaultRepRange(ex('Bicep Curl (Barbell)', 'Barbell'))).toEqual({ min: 10, max: 15 });
    expect(defaultRepRange(ex('Seated Row (Cable)', 'Cable'))).toEqual({ min: 10, max: 15 });
  });
  it('reps-only, duration and distance: none', () => {
    expect(defaultRepRange(ex('Push Up', 'Bodyweight', 'reps_only'))).toBeNull();
    expect(defaultRepRange(ex('Plank', 'Bodyweight', 'duration'))).toBeNull();
    expect(defaultRepRange(ex('Running', 'Other', 'distance_duration', 'Cardio'))).toBeNull();
  });
  it('template override → exercise → none', () => {
    const e = { ...ex('Bench Press (Barbell)', 'Barbell'), repRange: { min: 3, max: 5 } };
    const t: Template = { id: 't', name: 'T', exercises: [{ exerciseId: e.id, order: 0, sets: [], repRange: { min: 6, max: 10 } }] };
    expect(effectiveRepRange(e, t)).toEqual({ min: 6, max: 10 });
    expect(effectiveRepRange(e, undefined)).toEqual({ min: 3, max: 5 });
    expect(exerciseRepRange({ ...e, repRange: null })).toBeNull();
  });
});

describe('suggestProgression (double progression)', () => {
  const range = { min: 8, max: 12 };
  const base = { range, stepKg: 2.5, tracking: 'weight_reps' as const };

  it('increase: every working set hit the top at the same weight', () => {
    expect(suggestProgression({ ...base, sessions: [[set(80, 12), set(80, 12), set(80, 13)]] })).toEqual({ kind: 'increase', weightKg: 82.5, reps: 8 });
  });
  it('warm-ups and drop sets are ignored', () => {
    const s = [set(40, 5, 'warmup'), set(80, 12), set(80, 12), set(60, 6, 'drop')];
    expect(suggestProgression({ ...base, sessions: [s] })?.kind).toBe('increase');
  });
  it('hold: not all at the top but at least one in range', () => {
    expect(suggestProgression({ ...base, sessions: [[set(80, 12), set(80, 10), set(80, 9)]] })).toEqual({ kind: 'hold', weightKg: 80, targetReps: 10 });
  });
  it('top reps at mixed weights is a hold, not an increase', () => {
    expect(suggestProgression({ ...base, sessions: [[set(80, 12), set(77.5, 12)]] })?.kind).toBe('hold');
  });
  it('consider lighter: last two sessions all below the minimum at the same weight', () => {
    const below = [set(80, 6), set(80, 5)];
    expect(suggestProgression({ ...base, sessions: [below, [set(80, 7), set(80, 6)]] })).toEqual({ kind: 'decrease', weightKg: 77.5 });
    // Only one bad session → no hint (nothing in range either).
    expect(suggestProgression({ ...base, sessions: [below, [set(80, 9)]] })).toBeNull();
    // Two bad sessions at different weights → no hint.
    expect(suggestProgression({ ...base, sessions: [below, [set(82.5, 6)]] })).toBeNull();
  });
  it('lighter weight rounds to the step', () => {
    expect(suggestProgression({ ...base, stepKg: 2, sessions: [[set(81, 5)], [set(81, 5)]] })).toEqual({ kind: 'decrease', weightKg: 80 });
  });
  it('no hint without range, history or a weight-based tracking type', () => {
    expect(suggestProgression({ ...base, range: null, sessions: [[set(80, 12)]] })).toBeNull();
    expect(suggestProgression({ ...base, sessions: [] })).toBeNull();
    expect(suggestProgression({ ...base, tracking: 'reps_only', sessions: [[set(undefined, 12)]] })).toBeNull();
  });
  it('assisted: increase means less assistance, lighter means more', () => {
    const a = { ...base, tracking: 'assisted_bodyweight' as const };
    expect(suggestProgression({ ...a, sessions: [[set(20, 12), set(20, 12)]] })).toEqual({ kind: 'increase', weightKg: 17.5, reps: 8 });
    expect(suggestProgression({ ...a, sessions: [[set(20, 5)], [set(20, 5)]] })).toEqual({ kind: 'decrease', weightKg: 22.5 });
    expect(suggestProgression({ ...a, sessions: [[set(0, 12)]] })?.kind).not.toBe('increase');
  });
});
