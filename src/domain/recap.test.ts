import { describe, expect, it } from 'vitest';
import { availableRecaps, computeRecap, dueRecaps, longestWeekStreak, parseRecapKey, recapKey, recapTitle } from './recap';
import { monthPeriod } from './muscles';
import { buildPRHistory } from './prs';
import { set, we, workout } from '../test/fixtures';
import type { Exercise, Workout } from './types';

const exMap = new Map<string, Exercise>([
  ['bench', { id: 'bench', name: 'Bench', bodyPart: 'Chest', equipment: 'Barbell', trackingType: 'weight_reps', isCustom: false, primaryMuscles: ['chest'], secondaryMuscles: ['triceps'] }],
  ['squat', { id: 'squat', name: 'Squat', bodyPart: 'Legs', equipment: 'Barbell', trackingType: 'weight_reps', isCustom: false, primaryMuscles: ['quads', 'glutes'], secondaryMuscles: [] }],
  ['plank', { id: 'plank', name: 'Plank', bodyPart: 'Core', equipment: 'Bodyweight', trackingType: 'duration', isCustom: false, primaryMuscles: ['abs'], secondaryMuscles: [] }],
]);
const d = (m: number, day: number, h = 18) => new Date(2026, m, day, h).getTime();

function ctx(workouts: Workout[]) {
  const trackingOf = (id: string) => exMap.get(id)?.trackingType;
  return { workouts, exMap, prs: buildPRHistory(workouts, trackingOf, false), gyms: [{ id: 'a', name: 'Gym A' }, { id: 'b', name: 'Gym B' }], settings: { countWarmupsInStats: false } };
}

describe('recap aggregation', () => {
  const july = [workout(d(6, 6), [we('bench', [set(80, 8), set(80, 8)])])];
  const aug = [
    workout(d(7, 3, 7), [we('bench', [set(85, 5), set(40, 10, 'warmup')]), we('plank', [set(undefined, undefined, 'normal', { durationSec: 60 })])], { gymId: 'a', finishedAt: d(7, 3, 8) }),
    workout(d(7, 5), [we('squat', [set(100, 5), set(100, 5), set(100, 5)])], { gymId: 'a' }),
    workout(d(7, 12), [we('bench', [set(90, 3)])], { gymId: 'b' }),
    workout(d(7, 26), [we('squat', [set(110, 3)])], { gymId: 'a' }),
  ];
  const all = [...july, ...aug];
  const r = computeRecap({ kind: 'month', year: 2026, month: 7 }, ctx(all), d(8, 10));

  it('totals: workouts, time, sets, reps, volume (working sets only)', () => {
    expect(r.workouts).toBe(4);
    expect(r.sets).toBe(7);
    expect(r.reps).toBe(5 + 15 + 3 + 3);
    expect(r.volumeKg).toBe(425 + 1500 + 270 + 330);
    expect(r.totalTimeMs).toBe(3600_000 * 4);
    expect(r.partial).toBe(false);
  });
  it('change vs the previous period', () => {
    expect(r.change.workouts).toBe(300);
    expect(r.change.sets).toBeCloseTo(250);
    expect(recapTitle({ kind: 'month', year: 2026, month: 7 }, d(8, 1))).toBe('Your August in lifting');
  });
  it('PRs, biggest e1RM jump and heaviest set', () => {
    expect(r.prCount).toBeGreaterThan(0);
    expect(r.biggestJump).toMatchObject({ exerciseId: 'squat' }); // 110×3 (121) beat 100×5 (116.7)
    expect(r.biggestJump!.pct).toBeCloseTo(3.71, 1);
    expect(r.heaviestSet).toMatchObject({ exerciseId: 'squat', set: { weight: 110, reps: 3 } });
  });
  it('favourites, top exercise and muscle, streak, top gym', () => {
    expect(r.topExercise).toEqual({ exerciseId: 'squat', sets: 4 });
    expect(r.topMuscle?.muscle).toBe('quads');
    expect(r.favouriteTime).toBe('evening');
    expect(r.topGym).toEqual({ gymId: 'a', name: 'Gym A', workouts: 3 });
    // Weeks of Aug 3 and Aug 10 trained, Aug 17 not, Aug 24 trained.
    expect(r.longestWeekStreak).toBe(2);
  });
  it('one gym only → no top gym', () => {
    expect(computeRecap({ kind: 'month', year: 2026, month: 6 }, ctx(all), d(8, 10)).topGym).toBeUndefined();
  });
  it('year: monthly volume, top exercises, you vs a year ago', () => {
    const lastYear = workout(new Date(2025, 5, 1).getTime(), [we('bench', [set(60, 5)])]);
    const y = computeRecap({ kind: 'year', year: 2026 }, ctx([lastYear, ...all]), new Date(2027, 0, 5).getTime());
    expect(y.monthlyVolume).toHaveLength(12);
    expect(y.monthlyVolume![7].volumeKg).toBe(r.volumeKg);
    expect(y.topExercises![0].exerciseId).toBe('bench');
    const bench = y.vsYearAgo!.find((v) => v.exerciseId === 'bench')!;
    expect(bench.then).toBe(70); // 60×5 e1RM
    expect(bench.now).toBeCloseTo(101.33, 1); // 80×8 in July
    expect(y.prCount).toBe(buildPRHistory([lastYear, ...all], (id) => exMap.get(id)?.trackingType, false).filter((p) => p.date >= new Date(2026, 0, 1).getTime()).length);
  });
  it('a year in progress is "so far" and compares with the same dates last year', () => {
    const y = computeRecap({ kind: 'year', year: 2026 }, ctx(all), d(11, 5));
    expect(y.partial).toBe(true);
    expect(recapTitle({ kind: 'year', year: 2026 }, d(11, 5))).toBe('Your 2026 so far');
  });
  it('longest week streak', () => {
    const ws = [d(8, 1), d(8, 8), d(8, 15), d(8, 29)].map((t) => workout(t, []));
    expect(longestWeekStreak(ws, monthPeriod(2026, 8))).toBe(3);
  });
});

describe('where recaps appear', () => {
  const ws = [workout(d(7, 20), []), workout(new Date(2025, 11, 3).getTime(), [])];
  it('previous month from the 1st, until dismissed', () => {
    expect(dueRecaps(ws, d(8, 1, 9)).map((r) => r.title)).toEqual(['Your August in lifting']);
    expect(dueRecaps(ws, d(8, 1, 9), ['month:2026-08'])).toEqual([]);
    expect(dueRecaps(ws, d(9, 1))).toEqual([]); // September had no workouts
  });
  it('year so far in December, full year in January', () => {
    expect(dueRecaps([workout(d(11, 2), [])], d(11, 5)).map((r) => r.title)).toContain('Your 2026 so far');
    expect(dueRecaps(ws, new Date(2026, 0, 10).getTime()).map((r) => r.title)).toEqual(['Your 2025 in lifting', 'Your December in lifting']);
    expect(dueRecaps(ws, new Date(2026, 1, 1).getTime()).map((r) => r.title)).not.toContain('Your 2025 in lifting');
  });
  it('lists every month and year with data; keys round-trip', () => {
    const a = availableRecaps(ws);
    expect(a.months.map(recapKey)).toEqual(['2026-08', '2025-12']);
    expect(a.years.map(recapKey)).toEqual(['2026', '2025']);
    expect(parseRecapKey('2026-08')).toEqual({ kind: 'month', year: 2026, month: 7 });
    expect(parseRecapKey('2025')).toEqual({ kind: 'year', year: 2025 });
  });
});
