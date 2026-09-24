import { describe, expect, it } from 'vitest';
import { bestSetOf, compareSets, computeRecords, epley1RM, workoutVolume } from './records';
import { set, we, workout } from '../test/fixtures';

describe('epley1RM', () => {
  it('uses w × (1 + reps/30)', () => {
    expect(epley1RM(100, 5)).toBeCloseTo(116.667, 2);
    expect(epley1RM(100, 10)).toBeCloseTo(133.333, 2);
  });
  it('1 rep = the weight itself', () => expect(epley1RM(140, 1)).toBe(140));
  it('not estimated above 12 reps or for 0 reps', () => {
    expect(epley1RM(60, 13)).toBeUndefined();
    expect(epley1RM(60, 0)).toBeUndefined();
    expect(epley1RM(60, 12)).toBeCloseTo(84);
  });
});

describe('best set (weight priority, reps tiebreak)', () => {
  it('heavier set wins even with fewer reps', () => {
    const a = set(100, 5), b = set(97.5, 10);
    expect(bestSetOf([b, a], 'weight_reps')).toBe(a);
  });
  it('equal weight: more reps wins', () => {
    const a = set(100, 6), b = set(100, 5);
    expect(bestSetOf([b, a], 'weight_reps')).toBe(a);
  });
  it('weighted bodyweight: highest added weight then reps', () => {
    const a = set(20, 5), b = set(10, 12), c = set(20, 6);
    expect(bestSetOf([a, b, c], 'weighted_bodyweight')).toBe(c);
  });
  it('assisted bodyweight: LOWEST assistance wins, then reps', () => {
    const a = set(30, 10), b = set(20, 6), c = set(20, 8);
    expect(bestSetOf([a, b, c], 'assisted_bodyweight')).toBe(c);
  });
  it('reps only: most reps', () => {
    expect(bestSetOf([set(undefined, 12), set(undefined, 15), set(undefined, 9)], 'reps_only')?.reps).toBe(15);
  });
  it('duration: longest', () => {
    const a = set(undefined, undefined, 'normal', { durationSec: 60 });
    const b = set(undefined, undefined, 'normal', { durationSec: 90 });
    expect(bestSetOf([a, b], 'duration')).toBe(b);
  });
  it('distance_duration: longest distance, then fastest', () => {
    const a = set(undefined, undefined, 'normal', { distanceM: 5000, durationSec: 1500 });
    const b = set(undefined, undefined, 'normal', { distanceM: 5000, durationSec: 1400 });
    const c = set(undefined, undefined, 'normal', { distanceM: 3000, durationSec: 600 });
    expect(bestSetOf([a, c, b], 'distance_duration')).toBe(b);
    expect(compareSets(a, c, 'distance_duration')).toBeGreaterThan(0);
  });
});

describe('computeRecords', () => {
  const history = [
    workout(1000, [we('bench', [set(60, 10, 'warmup'), set(100, 5), set(97.5, 10)])]),
    workout(2000, [we('bench', [set(150, 1, 'warmup'), set(100, 6), set(90, 8, 'drop')])]),
    workout(3000, [we('bench', [set(80, 12, 'failure')])], { finishedAt: undefined }), // in progress: ignored
  ];
  it('best set excludes warm-ups by default and uses weight priority', () => {
    const r = computeRecords('bench', 'weight_reps', history, false);
    expect(r.bestSet?.weight).toBe(100);
    expect(r.bestSet?.reps).toBe(6);
    expect(r.sessionCount).toBe(2);
  });
  it('includes warm-ups when countWarmupsInStats', () => {
    expect(computeRecords('bench', 'weight_reps', history, true).bestSet?.weight).toBe(150);
  });
  it('best e1RM, best volume and rep maxes (≥ N reps)', () => {
    const r = computeRecords('bench', 'weight_reps', history, false);
    expect(r.bestE1RM).toBeCloseTo(97.5 * (1 + 10 / 30));
    expect(r.bestVolume).toBe(100 * 5 + 97.5 * 10);
    const rm = Object.fromEntries(r.repMaxes.map((x) => [x.reps, x.weight]));
    expect(rm[1]).toBe(100);
    expect(rm[5]).toBe(100);
    expect(rm[8]).toBe(97.5);
    expect(rm[12]).toBeUndefined();
  });
  it('workout volume counts only load-bearing, completed, non-warm-up sets', () => {
    const w = workout(0, [we('bench', [set(60, 10, 'warmup'), set(100, 5), { ...set(100, 5), completed: false }]), we('pushup', [set(undefined, 20)])]);
    const t = (id: string): 'weight_reps' | 'reps_only' => (id === 'bench' ? 'weight_reps' : 'reps_only');
    expect(workoutVolume(w, t, false)).toBe(500);
  });
});
