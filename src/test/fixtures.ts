import type { SetType, Workout, WorkoutExercise, WorkoutSet } from '../domain/types';

let n = 0;
export const id = (p = 'x') => `${p}${++n}`;

export function set(weight: number | undefined, reps: number | undefined, type: SetType = 'normal', extra: Partial<WorkoutSet> = {}): WorkoutSet {
  return { id: id('s'), type, weight, reps, completed: true, completedAt: ++n, ...extra };
}

export function we(exerciseId: string, sets: WorkoutSet[], extra: Partial<WorkoutExercise> = {}): WorkoutExercise {
  return { id: id('we'), exerciseId, order: 0, sets, ...extra };
}

export function workout(startedAt: number, exercises: WorkoutExercise[], extra: Partial<Workout> = {}): Workout {
  return {
    id: id('w'),
    name: 'W',
    startedAt,
    finishedAt: startedAt + 3600_000,
    exercises: exercises.map((e, i) => ({ ...e, order: i })),
    ...extra,
  };
}
