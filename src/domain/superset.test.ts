import { describe, expect, it } from 'vitest';
import { afterSetCompleted, blocks, supersetInfo } from './superset';
import { linkSuperset, unlinkSuperset, moveBlock } from './workoutOps';
import type { Workout, WorkoutSet } from './types';

const s = (id: string, completed = false, type: WorkoutSet['type'] = 'normal'): WorkoutSet => ({ id, type, completed, weight: 50, reps: 5 });

function wk(): Workout {
  return {
    id: 'w', name: 'W', startedAt: 0,
    exercises: [
      { id: 'A', exerciseId: 'bench', order: 0, supersetGroupId: 'g', sets: [s('a1'), s('a2'), s('a3')] },
      { id: 'B', exerciseId: 'row', order: 1, supersetGroupId: 'g', sets: [s('b1'), s('b2'), s('b3')] },
      { id: 'C', exerciseId: 'curl', order: 2, sets: [s('c1'), s('c2', false, 'drop'), s('c3')] },
    ],
  };
}
const complete = (w: Workout, id: string): Workout => ({
  ...w,
  exercises: w.exercises.map((e) => ({ ...e, sets: e.sets.map((x) => (x.id === id ? { ...x, completed: true } : x)) })),
});

describe('superset rest-timer rule', () => {
  it('completing A1 moves to B1 without rest', () => {
    const w = complete(wk(), 'a1');
    expect(afterSetCompleted(w, 'A', 'a1')).toEqual({ startRest: false, nextSetId: 'b1' });
  });
  it('rest starts only after the last exercise in the round, focus goes to A2', () => {
    const w = complete(complete(wk(), 'a1'), 'b1');
    expect(afterSetCompleted(w, 'B', 'b1')).toMatchObject({ startRest: true, restFromWorkoutExerciseId: 'B', nextSetId: 'a2' });
  });
  it('works for giant sets (3+ exercises)', () => {
    let w = wk();
    w = linkSuperset(w, 'B', 'C');
    w = complete(complete(w, 'a1'), 'b1');
    expect(afterSetCompleted(w, 'B', 'b1')).toMatchObject({ startRest: false, nextSetId: 'c1' });
  });
  it('out-of-order completion: finishing B1 first sends you back to A1, no rest', () => {
    const w = complete(wk(), 'b1');
    expect(afterSetCompleted(w, 'B', 'b1')).toEqual({ startRest: false, nextSetId: 'a1' });
  });
  it('uneven set counts: extra sets of one member rest normally', () => {
    let w = wk();
    w.exercises[1].sets = [s('b1', true)];
    w.exercises[0].sets = [s('a1', true), s('a2', true)];
    expect(afterSetCompleted(w, 'A', 'a2').startRest).toBe(true);
  });
  it('plain exercise rests after each set, but not between a set and its drop set', () => {
    let w = complete(wk(), 'c1');
    expect(afterSetCompleted(w, 'C', 'c1')).toEqual({ startRest: false, nextSetId: 'c2' });
    w = complete(w, 'c2');
    expect(afterSetCompleted(w, 'C', 'c2')).toMatchObject({ startRest: true, nextSetId: 'c3' });
  });
});

describe('superset grouping', () => {
  it('linking makes members adjacent and labels groups A, B…', () => {
    let w: Workout = {
      id: 'w', name: 'W', startedAt: 0,
      exercises: [
        { id: 'A', exerciseId: 'a', order: 0, sets: [] },
        { id: 'B', exerciseId: 'b', order: 1, sets: [] },
        { id: 'C', exerciseId: 'c', order: 2, sets: [] },
      ],
    };
    w = linkSuperset(w, 'A', 'C');
    const order = [...w.exercises].sort((x, y) => x.order - y.order).map((e) => e.id);
    expect(order).toEqual(['A', 'C', 'B']);
    const info = supersetInfo(w.exercises);
    expect([...info.values()][0]).toMatchObject({ letter: 'A', size: 2 });
    w = unlinkSuperset(w, 'C');
    expect(w.exercises.every((e) => !e.supersetGroupId)).toBe(true); // group of 1 dissolves
  });
  it('reordering moves superset groups together', () => {
    const items = [
      { id: 'X', order: 0 },
      { id: 'A', order: 1, supersetGroupId: 'g' },
      { id: 'B', order: 2, supersetGroupId: 'g' },
    ];
    expect(blocks(items).length).toBe(2);
    expect(moveBlock(items, 1, 0).map((i) => i.id)).toEqual(['A', 'B', 'X']);
  });
});
