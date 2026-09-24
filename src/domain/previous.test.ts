import { describe, expect, it } from 'vitest';
import { defaultSetCount, findPreviousPerformance, placeholderFrom, previousForRows } from './previous';
import { set, we, workout } from '../test/fixtures';

describe('findPreviousPerformance', () => {
  const pushDay = workout(1000, [we('bench', [set(80, 8)])], { name: 'Push Day', templateId: 't-push' });
  const fullBody = workout(2000, [we('squat', [set(100, 5)]), we('bench', [set(82.5, 8), set(82.5, 7)])], { name: 'Full Body A', templateId: 't-fb' });
  const inProgress = workout(3000, [we('bench', [set(200, 1)])], { finishedAt: undefined });

  it('uses the most recent finished workout across different workouts/templates', () => {
    const p = findPreviousPerformance('bench', [pushDay, fullBody, inProgress]);
    expect(p?.workoutId).toBe(fullBody.id);
    expect(p?.sets.map((s) => s.weight)).toEqual([82.5, 82.5]);
  });
  it('ignores the in-progress workout', () => {
    const p = findPreviousPerformance('bench', [inProgress]);
    expect(p).toBeUndefined();
  });
  it('respects excludeWorkoutId and before', () => {
    expect(findPreviousPerformance('bench', [pushDay, fullBody], { excludeWorkoutId: fullBody.id })?.workoutId).toBe(pushDay.id);
    expect(findPreviousPerformance('bench', [pushDay, fullBody], { before: 2000 })?.workoutId).toBe(pushDay.id);
  });
  it('only considers completed sets', () => {
    const w = workout(5000, [we('row', [{ ...set(50, 10), completed: false }])]);
    expect(findPreviousPerformance('row', [w])).toBeUndefined();
  });
});

describe('previousForRows (position matching)', () => {
  const prev = [set(40, 10, 'warmup'), set(60, 5, 'warmup'), set(100, 5), set(100, 4, 'failure'), set(80, 8, 'drop')];

  it('matches working sets by position among non-warm-ups', () => {
    const rows = previousForRows([{ type: 'normal' }, { type: 'normal' }], prev);
    expect(rows.map((r) => r?.weight)).toEqual([100, 100]);
    expect(rows[1]?.reps).toBe(4);
  });
  it('warm-ups match warm-ups', () => {
    const rows = previousForRows([{ type: 'warmup' }, { type: 'warmup' }, { type: 'normal' }], prev);
    expect(rows.map((r) => r?.weight)).toEqual([40, 60, 100]);
  });
  it('extra rows fall back to the last set of the previous session', () => {
    const rows = previousForRows([{ type: 'normal' }, { type: 'normal' }, { type: 'normal' }, { type: 'normal' }], prev);
    expect(rows.map((r) => r?.weight)).toEqual([100, 100, 80, 80]);
  });
  it('no history → undefined for every row', () => {
    expect(previousForRows([{ type: 'normal' }], undefined)).toEqual([undefined]);
  });
  it('warm-up row with no previous warm-ups shows nothing', () => {
    expect(previousForRows([{ type: 'warmup' }], [set(100, 5)])).toEqual([undefined]);
  });
});

describe('placeholders and default set count', () => {
  it('placeholder is the previous values; falls back to template target reps', () => {
    expect(placeholderFrom(set(100, 5))).toEqual({ weight: 100, reps: 5 });
    expect(placeholderFrom(undefined, 8)).toEqual({ reps: 8 });
    expect(placeholderFrom(undefined)).toBeUndefined();
  });
  it('ad-hoc exercise gets last time’s working-set count (min 1)', () => {
    expect(defaultSetCount(undefined)).toBe(1);
    expect(defaultSetCount({ workoutId: 'w', startedAt: 0, sets: [set(40, 10, 'warmup'), set(100, 5), set(100, 5), set(90, 5, 'failure'), set(70, 8, 'drop')] })).toBe(3);
    expect(defaultSetCount({ workoutId: 'w', startedAt: 0, sets: [set(40, 10, 'warmup')] })).toBe(1);
  });
});
