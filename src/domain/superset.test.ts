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

describe('next set after completing one (superset rounds)', () => {
  it('completing A1 moves to B1', () => {
    const w = complete(wk(), 'a1');
    expect(afterSetCompleted(w, 'A', 'a1')).toEqual({ nextSetId: 'b1' });
  });
  it('after the last exercise in the round, focus goes to A2', () => {
    const w = complete(complete(wk(), 'a1'), 'b1');
    expect(afterSetCompleted(w, 'B', 'b1')).toEqual({ nextSetId: 'a2' });
  });
  it('warm-ups are not rounds: A1 still pairs with B1', () => {
    const w = wk();
    w.exercises[0].sets = [s('aw', true, 'warmup'), s('a1', true), s('a2')];
    expect(afterSetCompleted(w, 'A', 'a1')).toEqual({ nextSetId: 'b1' });
  });
  it('after a warm-up, the same exercise continues; a partner’s warm-up comes before its first set', () => {
    const w = wk();
    w.exercises[0].sets = [s('aw', true, 'warmup'), s('a1'), s('a2')];
    w.exercises[1].sets = [s('bw', false, 'warmup'), s('b1'), s('b2')];
    expect(afterSetCompleted(w, 'A', 'aw')).toEqual({ nextSetId: 'a1' });
    w.exercises[0].sets[1] = s('a1', true);
    expect(afterSetCompleted(w, 'A', 'a1')).toEqual({ nextSetId: 'bw' });
  });
  it('works for giant sets (3+ exercises)', () => {
    let w = wk();
    w = linkSuperset(w, 'B', 'C');
    w = complete(complete(w, 'a1'), 'b1');
    expect(afterSetCompleted(w, 'B', 'b1')).toEqual({ nextSetId: 'c1' });
  });
  it('out-of-order completion: finishing B1 first sends you back to A1', () => {
    const w = complete(wk(), 'b1');
    expect(afterSetCompleted(w, 'B', 'b1')).toEqual({ nextSetId: 'a1' });
  });
  it('uneven set counts: when the group is done, moves on to the next exercise', () => {
    const w = wk();
    w.exercises[1].sets = [s('b1', true)];
    w.exercises[0].sets = [s('a1', true), s('a2', true)];
    expect(afterSetCompleted(w, 'A', 'a2')).toEqual({ nextSetId: 'c1' });
  });
  it('plain exercise: a set goes to its drop set, then to the next set', () => {
    let w = complete(wk(), 'c1');
    expect(afterSetCompleted(w, 'C', 'c1')).toEqual({ nextSetId: 'c2' });
    w = complete(w, 'c2');
    expect(afterSetCompleted(w, 'C', 'c2')).toEqual({ nextSetId: 'c3' });
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
