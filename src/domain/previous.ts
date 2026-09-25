import type { SetValues, Workout, WorkoutSet } from './types';
import { pickValues } from './sets';

export interface PreviousPerformance {
  workoutId: string;
  startedAt: number;
  sets: WorkoutSet[]; // completed sets of that session, in order
  gymId?: string;
  /** True when a gym was asked for, there was no session there, and this one is from a different gym. */
  otherGym?: boolean;
}

export interface PreviousOptions {
  excludeWorkoutId?: string;
  before?: number;
  /** Prefer sessions at this gym. */
  gymId?: string;
}

/** Every finished session of the exercise matching the options, newest first. */
function allSessions(exerciseId: string, workouts: Workout[], opts: PreviousOptions): PreviousPerformance[] {
  const out: PreviousPerformance[] = [];
  for (const w of workouts) {
    if (w.finishedAt === undefined || w.id === opts.excludeWorkoutId) continue;
    if (opts.before !== undefined && w.startedAt >= opts.before) continue;
    // If the exercise appears twice in one workout, use its sets concatenated.
    const sets = w.exercises
      .filter((we) => we.exerciseId === exerciseId)
      .flatMap((we) => we.sets.filter((s) => s.completed));
    if (sets.length) out.push({ workoutId: w.id, startedAt: w.startedAt, sets, gymId: w.gymId });
  }
  return out.sort((a, b) => b.startedAt - a.startedAt);
}

/**
 * The sessions PREVIOUS draws from, newest first: those at `gymId` when there
 * are any, otherwise all of them ("anywhere", which includes gym-less
 * workouts). Fallback sessions from a different gym are flagged `otherGym`.
 */
export function previousSessions(exerciseId: string, workouts: Workout[], opts: PreviousOptions = {}): PreviousPerformance[] {
  const all = allSessions(exerciseId, workouts, opts);
  if (!opts.gymId) return all;
  const atGym = all.filter((s) => s.gymId === opts.gymId);
  if (atGym.length) return atGym;
  return all.map((s) => (s.gymId !== undefined && s.gymId !== opts.gymId ? { ...s, otherGym: true } : s));
}

/**
 * Most recent FINISHED workout containing the exercise — regardless of which
 * workout/template it came from (exercise memory is global), preferring the
 * given gym. The in-progress workout (no finishedAt) and `excludeWorkoutId`
 * are ignored; `before` limits the search to workouts started earlier (used
 * when editing a past workout).
 */
export function findPreviousPerformance(
  exerciseId: string,
  workouts: Workout[],
  opts: PreviousOptions = {},
): PreviousPerformance | undefined {
  return previousSessions(exerciseId, workouts, opts)[0];
}

const isWarmup = (s: Pick<WorkoutSet, 'type'>) => s.type === 'warmup';

/**
 * PREVIOUS value for each row of the current exercise. Warm-ups match
 * warm-ups by position; all other sets match non-warm-up sets by position.
 * Rows beyond last time's count fall back to the last set of the same kind.
 * No matching history → undefined ("—").
 */
export function previousForRows(
  current: Pick<WorkoutSet, 'type'>[],
  previous: WorkoutSet[] | undefined,
): (WorkoutSet | undefined)[] {
  if (!previous?.length) return current.map(() => undefined);
  const prevWarm = previous.filter(isWarmup);
  const prevWork = previous.filter((s) => !isWarmup(s));
  let wi = 0;
  let ni = 0;
  return current.map((s) => {
    const pool = isWarmup(s) ? prevWarm : prevWork;
    const i = isWarmup(s) ? wi++ : ni++;
    if (!pool.length) return undefined;
    return pool[Math.min(i, pool.length - 1)];
  });
}

export function placeholderFrom(prev: WorkoutSet | undefined, targetReps?: number): SetValues | undefined {
  if (prev) return pickValues(prev);
  if (targetReps !== undefined) return { reps: targetReps };
  return undefined;
}

/** Default set count for an ad-hoc added exercise: last time's working sets (min 1). */
export function defaultSetCount(previous: PreviousPerformance | undefined): number {
  if (!previous) return 1;
  const working = previous.sets.filter((s) => s.type === 'normal' || s.type === 'failure').length;
  return Math.max(1, working);
}
