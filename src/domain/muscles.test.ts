import { describe, expect, it } from 'vitest';
import { muscleSets, muscleStatus, recencyLevel, volumeLevel, weekPeriod, weeklyRows, lastTrained, calendarDaysBetween } from './muscles';
import { set, we, workout } from '../test/fixtures';
import type { Exercise } from './types';
import { DEFAULT_SETTINGS } from './types';

const exMap = new Map<string, Exercise>([
  ['bench', { id: 'bench', name: 'Bench', bodyPart: 'Chest', equipment: 'Barbell', trackingType: 'weight_reps', isCustom: false, primaryMuscles: ['chest'], secondaryMuscles: ['front_delts', 'triceps'] }],
  ['run', { id: 'run', name: 'Run', bodyPart: 'Cardio', equipment: 'Other', trackingType: 'distance_duration', isCustom: false, primaryMuscles: ['quads'], secondaryMuscles: [] }],
  ['mine', { id: 'mine', name: 'Mine', bodyPart: 'Other', equipment: 'Other', trackingType: 'weight_reps', isCustom: true }],
]);

describe('weekly sets per muscle', () => {
  it('+1 per working set to primary, +0.5 to secondary', () => {
    const w = workout(Date.now(), [we('bench', [set(40, 10, 'warmup'), set(80, 8), set(80, 8, 'failure'), set(60, 10, 'drop')])]);
    const r = muscleSets([w], exMap, false);
    expect(r.chest).toEqual({ primary: 3, secondary: 0, total: 3 });
    expect(r.triceps.total).toBe(1.5);
    expect(r.front_delts.total).toBe(1.5);
  });
  it('warm-ups count when the setting is on', () => {
    const w = workout(Date.now(), [we('bench', [set(40, 10, 'warmup'), set(80, 8)])]);
    expect(muscleSets([w], exMap, true).chest.total).toBe(2);
  });
  it('ignores incomplete sets, cardio, untagged exercises and unfinished workouts', () => {
    const w = workout(Date.now(), [we('bench', [set(80, 8, 'normal', { completed: false })]), we('run', [set(undefined, undefined, 'normal', { distanceM: 5000 })]), we('mine', [set(10, 10)])]);
    const r = muscleSets([w, workout(Date.now(), [we('bench', [set(80, 8)])], { finishedAt: undefined })], exMap, false);
    expect(Object.values(r).every((m) => m.total === 0)).toBe(true);
  });
  it('only counts workouts inside the period', () => {
    const now = new Date(2026, 8, 24, 12).getTime(); // Thursday
    const wk = weekPeriod(now);
    const inside = workout(new Date(2026, 8, 21, 7).getTime(), [we('bench', [set(80, 8)])]); // Monday
    const before = workout(new Date(2026, 8, 20, 23).getTime(), [we('bench', [set(80, 8)])]); // Sunday before
    expect(muscleSets([inside, before], exMap, false, wk).chest.total).toBe(1);
  });
  it('weeks run Monday 00:00 to Monday 00:00 local', () => {
    const p = weekPeriod(new Date(2026, 8, 27, 22).getTime()); // Sunday night
    expect(new Date(p.start)).toEqual(new Date(2026, 8, 21, 0, 0, 0, 0));
    expect(new Date(p.end)).toEqual(new Date(2026, 8, 28, 0, 0, 0, 0));
    expect(new Date(weekPeriod(p.start, -1).start)).toEqual(new Date(2026, 8, 14));
  });
  it('status and sorting against the target', () => {
    const t = { min: 10, max: 20 };
    expect(muscleStatus(0, t)).toBe('none');
    expect(muscleStatus(9.5, t)).toBe('under');
    expect(muscleStatus(10, t)).toBe('in');
    expect(muscleStatus(20, t)).toBe('in');
    expect(muscleStatus(21, t)).toBe('over');
    const w = workout(Date.now(), [we('bench', [set(80, 8), set(80, 8)])]);
    const rows = weeklyRows(muscleSets([w], exMap, false), { ...DEFAULT_SETTINGS, muscleTargets: { chest: { min: 1, max: 2 } } });
    expect(rows[0]).toMatchObject({ muscle: 'chest', sets: 2, status: 'in', target: { min: 1, max: 2 } });
    expect(rows[1].muscle).toBe('front_delts');
    expect(rows[rows.length - 1].sets).toBe(0);
  });
});

describe('muscle map levels', () => {
  it('volume: 0 none, 1 under half of min, 2 under min, 3 in range, 4 over max', () => {
    const t = { min: 10, max: 20 };
    expect(volumeLevel(0, t)).toBe(0);
    expect(volumeLevel(4.5, t)).toBe(1);
    expect(volumeLevel(5, t)).toBe(2);
    expect(volumeLevel(9.5, t)).toBe(2);
    expect(volumeLevel(10, t)).toBe(3);
    expect(volumeLevel(20, t)).toBe(3);
    expect(volumeLevel(20.5, t)).toBe(4);
  });
  it('recency: 0–2 days, 3–5, 6–9, 10+, never', () => {
    expect(recencyLevel(0)).toBe(4);
    expect(recencyLevel(2)).toBe(4);
    expect(recencyLevel(3)).toBe(3);
    expect(recencyLevel(5)).toBe(3);
    expect(recencyLevel(6)).toBe(2);
    expect(recencyLevel(9)).toBe(2);
    expect(recencyLevel(10)).toBe(1);
    expect(recencyLevel(undefined)).toBe(0);
  });
  it('last trained includes secondary muscles and cardio', () => {
    const t1 = new Date(2026, 8, 20, 18).getTime();
    const r = lastTrained([workout(t1, [we('bench', [set(80, 8)]), we('run', [set(undefined, undefined, 'normal', { distanceM: 5000 })])])], exMap);
    expect(r.triceps).toBe(t1);
    expect(r.quads).toBe(t1);
    expect(r.lats).toBeUndefined();
    expect(calendarDaysBetween(t1, new Date(2026, 8, 23, 9).getTime())).toBe(3);
  });
});
