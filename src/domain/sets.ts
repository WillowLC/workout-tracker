import type { SetType, SetValues, TrackingType, WorkoutSet } from './types';

/** Label shown in the SET column. Normal and failure sets are numbered; W/D are not. */
export function setLabels(sets: Pick<WorkoutSet, 'type'>[]): string[] {
  let n = 0;
  return sets.map((s) => {
    if (s.type === 'warmup') return 'W';
    if (s.type === 'drop') return 'D';
    n += 1;
    return s.type === 'failure' ? 'F' : String(n);
  });
}

/** Working-set number for normal/failure sets (1-based), undefined for W/D. */
export function setNumbers(sets: Pick<WorkoutSet, 'type'>[]): (number | undefined)[] {
  let n = 0;
  return sets.map((s) => (s.type === 'warmup' || s.type === 'drop' ? undefined : ++n));
}

/** Tapping the current type again reverts to normal. */
export function toggleSetType(current: SetType, chosen: SetType): SetType {
  return current === chosen ? 'normal' : chosen;
}

export const FIELDS_BY_TRACKING: Record<TrackingType, (keyof SetValues)[]> = {
  weight_reps: ['weight', 'reps'],
  weighted_bodyweight: ['weight', 'reps'],
  assisted_bodyweight: ['weight', 'reps'],
  reps_only: ['reps'],
  duration: ['durationSec'],
  distance_duration: ['distanceM', 'durationSec'],
};

/** Fields that must have a value before a set may be completed. */
function requiredFields(t: TrackingType): (keyof SetValues)[] {
  if (t === 'weighted_bodyweight' || t === 'assisted_bodyweight') return ['reps'];
  return FIELDS_BY_TRACKING[t];
}

export function hasAnyValue(set: SetValues, t: TrackingType): boolean {
  return FIELDS_BY_TRACKING[t].some((f) => set[f] !== undefined);
}

/**
 * Check-off a set. Any field the user left empty takes the placeholder
 * (ghost) value from PREVIOUS — Strong's core speed trick. Returns null if the
 * set still lacks a required value.
 */
export function commitSet(
  set: WorkoutSet,
  placeholder: SetValues | undefined,
  t: TrackingType,
  now: number,
): WorkoutSet | null {
  const next: WorkoutSet = { ...set };
  for (const f of [...FIELDS_BY_TRACKING[t], 'rpe'] as (keyof SetValues)[]) {
    if (next[f] === undefined && placeholder?.[f] !== undefined) next[f] = placeholder[f];
  }
  if (requiredFields(t).some((f) => next[f] === undefined)) return null;
  if ((t === 'weighted_bodyweight' || t === 'assisted_bodyweight') && next.weight === undefined) next.weight = 0;
  next.completed = true;
  next.completedAt = now;
  return next;
}

export function uncompleteSet(set: WorkoutSet): WorkoutSet {
  const { completedAt: _c, ...rest } = set;
  return { ...rest, completed: false };
}

export function pickValues(set: SetValues): SetValues {
  const v: SetValues = {};
  if (set.weight !== undefined) v.weight = set.weight;
  if (set.reps !== undefined) v.reps = set.reps;
  if (set.durationSec !== undefined) v.durationSec = set.durationSec;
  if (set.distanceM !== undefined) v.distanceM = set.distanceM;
  if (set.rpe !== undefined) v.rpe = set.rpe;
  return v;
}

export function countsInStats(set: Pick<WorkoutSet, 'type'>, countWarmups: boolean): boolean {
  return set.type !== 'warmup' || countWarmups;
}
