import { describe, expect, it } from 'vitest';
import { commitSet, setLabels, toggleSetType } from './sets';
import type { WorkoutSet } from './types';
import { fromDisplayWeight, parseClock, formatClock, toDisplayWeight, lbToKg, kgToLb } from './units';

describe('set numbering', () => {
  it('numbers normal and failure sets; W and D do not count', () => {
    const types = ['warmup', 'warmup', 'normal', 'drop', 'normal', 'failure', 'drop', 'normal'] as const;
    expect(setLabels(types.map((type) => ({ type })))).toEqual(['W', 'W', '1', 'D', '2', 'F', 'D', '4']);
  });
  it('recalculates when a type changes', () => {
    expect(setLabels([{ type: 'normal' }, { type: 'warmup' }, { type: 'normal' }])).toEqual(['1', 'W', '2']);
  });
  it('tapping the current type again reverts to normal', () => {
    expect(toggleSetType('warmup', 'warmup')).toBe('normal');
    expect(toggleSetType('normal', 'drop')).toBe('drop');
  });
});

describe('placeholder commit on check-off', () => {
  const empty: WorkoutSet = { id: 's', type: 'normal', completed: false };
  it('checking off an empty set commits the placeholder values', () => {
    const r = commitSet(empty, { weight: 80, reps: 8 }, 'weight_reps', 42);
    expect(r).toMatchObject({ weight: 80, reps: 8, completed: true, completedAt: 42 });
  });
  it('typed values win; only missing fields are filled', () => {
    const r = commitSet({ ...empty, weight: 85 }, { weight: 80, reps: 8 }, 'weight_reps', 1);
    expect(r).toMatchObject({ weight: 85, reps: 8 });
  });
  it('returns null when a required value is missing and there is no placeholder', () => {
    expect(commitSet(empty, undefined, 'weight_reps', 1)).toBeNull();
    expect(commitSet({ ...empty, weight: 50 }, undefined, 'weight_reps', 1)).toBeNull();
  });
  it('bodyweight variants only need reps (weight defaults to 0)', () => {
    expect(commitSet({ ...empty, reps: 10 }, undefined, 'assisted_bodyweight', 1)).toMatchObject({ weight: 0, reps: 10 });
  });
  it('duration and distance types', () => {
    expect(commitSet(empty, { durationSec: 60 }, 'duration', 1)?.durationSec).toBe(60);
    expect(commitSet({ ...empty, distanceM: 5000 }, undefined, 'distance_duration', 1)).toBeNull();
  });
});

describe('units', () => {
  it('kg ↔ lb round-trips through the display boundary', () => {
    for (const lb of [45, 135, 225, 2.5, 317.5]) {
      expect(toDisplayWeight(fromDisplayWeight(lb, 'lb'), 'lb')).toBe(lb);
    }
    for (const kg of [20, 102.5, 1.25]) expect(toDisplayWeight(fromDisplayWeight(kg, 'kg'), 'kg')).toBe(kg);
    expect(kgToLb(lbToKg(100))).toBeCloseTo(100, 10);
    expect(toDisplayWeight(100, 'lb')).toBe(220.46);
  });
  it('stopwatch-style clock entry', () => {
    expect(parseClock('130')).toBe(90);
    expect(parseClock('3000')).toBe(1800);
    expect(parseClock('10000')).toBe(3600);
    expect(parseClock('45')).toBe(45);
    expect(parseClock('1:30')).toBe(90);
    expect(parseClock('')).toBeUndefined();
    expect(formatClock(90)).toBe('1:30');
    expect(formatClock(3725)).toBe('1:02:05');
  });
});
