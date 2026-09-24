import type { TrackingType, Workout, WorkoutExercise, WorkoutSet } from './types';
import { countsInStats } from './sets';

/** Epley estimated 1RM. 1 rep → the weight itself; >12 reps → not estimated. */
export function epley1RM(weightKg: number, reps: number): number | undefined {
  if (!(reps >= 1) || reps > 12 || weightKg <= 0) return undefined;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export function usesWeight(t: TrackingType): boolean {
  return t === 'weight_reps' || t === 'weighted_bodyweight' || t === 'assisted_bodyweight';
}

/** Tracking types where e1RM and weight×reps volume are meaningful. */
export function hasLoadVolume(t: TrackingType): boolean {
  return t === 'weight_reps' || t === 'weighted_bodyweight';
}

export function setE1RM(set: WorkoutSet, t: TrackingType): number | undefined {
  if (!hasLoadVolume(t) || set.weight === undefined || set.reps === undefined) return undefined;
  return epley1RM(set.weight, set.reps);
}

/**
 * Compare two sets by the "best set" rule. Positive = a is better.
 * weight_reps / weighted: heavier wins, reps break ties.
 * assisted: LESS assistance wins, reps break ties.
 * reps_only: more reps. duration: longer. distance_duration: longer, then faster.
 */
export function compareSets(a: WorkoutSet, b: WorkoutSet, t: TrackingType): number {
  const n = (x: number | undefined) => x ?? 0;
  switch (t) {
    case 'weight_reps':
    case 'weighted_bodyweight':
      return n(a.weight) - n(b.weight) || n(a.reps) - n(b.reps);
    case 'assisted_bodyweight':
      return n(b.weight) - n(a.weight) || n(a.reps) - n(b.reps);
    case 'reps_only':
      return n(a.reps) - n(b.reps);
    case 'duration':
      return n(a.durationSec) - n(b.durationSec);
    case 'distance_duration': {
      const d = n(a.distanceM) - n(b.distanceM);
      if (d) return d;
      // Same distance: faster (shorter time) wins; missing time loses.
      const ta = a.durationSec ?? Infinity;
      const tb = b.durationSec ?? Infinity;
      return ta === tb ? 0 : ta < tb ? 1 : -1;
    }
  }
}

/** Per-set contribution to an exercise's session "volume" metric. */
export function setVolume(set: WorkoutSet, t: TrackingType): number {
  switch (t) {
    case 'weight_reps':
    case 'weighted_bodyweight':
      return (set.weight ?? 0) * (set.reps ?? 0);
    case 'assisted_bodyweight':
    case 'reps_only':
      return set.reps ?? 0;
    case 'duration':
      return set.durationSec ?? 0;
    case 'distance_duration':
      return set.distanceM ?? 0;
  }
}

export function statSets(we: WorkoutExercise, countWarmups: boolean): WorkoutSet[] {
  return we.sets.filter((s) => s.completed && countsInStats(s, countWarmups));
}

export function exerciseSessionVolume(we: WorkoutExercise, t: TrackingType, countWarmups: boolean): number {
  return statSets(we, countWarmups).reduce((acc, s) => acc + setVolume(s, t), 0);
}

export function bestSetOf(sets: WorkoutSet[], t: TrackingType): WorkoutSet | undefined {
  let best: WorkoutSet | undefined;
  for (const s of sets) if (!best || compareSets(s, best, t) > 0) best = s;
  return best;
}

export interface ExerciseSession {
  workout: Workout;
  we: WorkoutExercise;
}

/** All finished sessions containing an exercise, newest first. */
export function sessionsForExercise(exerciseId: string, workouts: Workout[]): ExerciseSession[] {
  const out: ExerciseSession[] = [];
  for (const w of workouts) {
    if (w.finishedAt === undefined) continue;
    for (const we of w.exercises) if (we.exerciseId === exerciseId) out.push({ workout: w, we });
  }
  return out.sort((a, b) => b.workout.startedAt - a.workout.startedAt);
}

export interface ExerciseRecords {
  bestSet?: WorkoutSet;
  bestE1RM?: number;
  bestE1RMSet?: WorkoutSet;
  bestVolume?: number;
  bestVolumeWorkoutId?: string;
  /** Best weight lifted for at least N reps. */
  repMaxes: { reps: number; weight?: number }[];
  sessionCount: number;
}

export const REP_MAX_TARGETS = [1, 2, 3, 5, 8, 10, 12];

export function computeRecords(
  exerciseId: string,
  t: TrackingType,
  workouts: Workout[],
  countWarmups: boolean,
): ExerciseRecords {
  const sessions = sessionsForExercise(exerciseId, workouts);
  const rec: ExerciseRecords = { repMaxes: REP_MAX_TARGETS.map((reps) => ({ reps })), sessionCount: sessions.length };
  for (const { workout, we } of sessions) {
    const sets = statSets(we, countWarmups);
    if (!sets.length) continue;
    const b = bestSetOf(sets, t);
    if (b && (!rec.bestSet || compareSets(b, rec.bestSet, t) > 0)) rec.bestSet = b;
    for (const s of sets) {
      const e = setE1RM(s, t);
      if (e !== undefined && (rec.bestE1RM === undefined || e > rec.bestE1RM)) {
        rec.bestE1RM = e;
        rec.bestE1RMSet = s;
      }
      if (hasLoadVolume(t) && s.weight !== undefined && s.reps !== undefined) {
        for (const rm of rec.repMaxes) {
          if (s.reps >= rm.reps && (rm.weight === undefined || s.weight > rm.weight)) rm.weight = s.weight;
        }
      }
    }
    const v = sets.reduce((a, s) => a + setVolume(s, t), 0);
    if (rec.bestVolume === undefined || v > rec.bestVolume) {
      rec.bestVolume = v;
      rec.bestVolumeWorkoutId = workout.id;
    }
  }
  return rec;
}

/** Total workout volume in kg (weight×reps for load-bearing exercises). */
export function workoutVolume(
  w: Workout,
  trackingOf: (exerciseId: string) => TrackingType | undefined,
  countWarmups: boolean,
): number {
  let total = 0;
  for (const we of w.exercises) {
    const t = trackingOf(we.exerciseId);
    if (!t || !hasLoadVolume(t)) continue;
    total += exerciseSessionVolume(we, t, countWarmups);
  }
  return total;
}

export function completedSetCount(w: Workout, countWarmups: boolean): number {
  return w.exercises.reduce((a, we) => a + statSets(we, countWarmups).length, 0);
}
