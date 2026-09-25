import type { PersonalRecord, PRKind, SetValues, TrackingType, Workout, WorkoutSet } from './types';
import { bestSetOf, compareSets, sessionsForExercise, setE1RM, setVolume, statSets } from './records';
import { countsInStats, pickValues } from './sets';

export type { PRKind } from './types';

export const PR_LABELS: Record<PRKind, string> = {
  weight: 'Best set',
  e1rm: 'Est. 1RM',
  volume: 'Volume',
};

/** A completed set with at least one logged number (a blank set is never a record). */
function hasValue(s: WorkoutSet): boolean {
  return [s.weight, s.reps, s.durationSec, s.distanceM].some((v) => v !== undefined && v > 0);
}

/** The number a best-set record is about: weight (assistance for assisted), reps, seconds or metres. */
export function prMetric(s: SetValues, t: TrackingType): number {
  switch (t) {
    case 'weight_reps':
    case 'weighted_bodyweight':
    case 'assisted_bodyweight':
      return s.weight ?? 0;
    case 'reps_only':
      return s.reps ?? 0;
    case 'duration':
      return s.durationSec ?? 0;
    case 'distance_duration':
      return s.distanceM ?? 0;
  }
}

/** Running records for one exercise, built from finished sessions. */
export interface RecordState {
  sessionCount: number;
  bestSet?: WorkoutSet;
  bestE1RM?: number;
  bestVolume?: number;
}

/** Fold one finished session (one WorkoutExercise) into the running records. Same rules as computeRecords. */
export function applySession(state: RecordState, sets: WorkoutSet[], t: TrackingType): RecordState {
  const next = { ...state, sessionCount: state.sessionCount + 1 };
  if (!sets.length) return next;
  const b = bestSetOf(sets, t);
  if (b && (!next.bestSet || compareSets(b, next.bestSet, t) > 0)) next.bestSet = b;
  for (const s of sets) {
    const e = setE1RM(s, t);
    if (e !== undefined && (next.bestE1RM === undefined || e > next.bestE1RM)) next.bestE1RM = e;
  }
  const v = sets.reduce((a, s) => a + setVolume(s, t), 0);
  if (next.bestVolume === undefined || v > next.bestVolume) next.bestVolume = v;
  return next;
}

export function recordStateFrom(exerciseId: string, t: TrackingType, prior: Workout[], countWarmups: boolean): RecordState {
  let st: RecordState = { sessionCount: 0 };
  for (const { we } of sessionsForExercise(exerciseId, prior).reverse()) st = applySession(st, statSets(we, countWarmups), t);
  return st;
}

export interface PRDetail {
  kind: PRKind;
  value: number;
  /** Undefined = first ever. */
  previous?: number;
  set: WorkoutSet;
  previousSet?: WorkoutSet;
}

export interface PRHit {
  setId: string;
  exerciseId: string;
  kinds: PRKind[];
  details: PRDetail[];
}

/**
 * Replay one exercise's completed sets (in completion order) against the
 * records from earlier workouts.
 */
function replayExercise(exerciseId: string, t: TrackingType, state: RecordState, sets: WorkoutSet[], hits: Map<string, PRHit>) {
  const firstEver = !state.sessionCount || !state.bestSet;
  let bestSet: WorkoutSet | undefined = firstEver ? undefined : state.bestSet;
  let bestE1 = firstEver ? undefined : state.bestE1RM;
  const bestVol = state.bestVolume ?? 0;
  let sessionVol = 0;
  let volumeAwarded = false;

  for (const s of sets) {
    const details: PRDetail[] = [];
    if (bestSet ? compareSets(s, bestSet, t) > 0 : hasValue(s)) {
      details.push({ kind: 'weight', value: prMetric(s, t), previous: bestSet && prMetric(bestSet, t), set: s, previousSet: bestSet });
      bestSet = s;
    }
    const e = setE1RM(s, t);
    if (e !== undefined && (bestE1 === undefined || e > bestE1 + 1e-9)) {
      if (bestE1 !== undefined && !firstEver) details.push({ kind: 'e1rm', value: e, previous: bestE1, set: s });
      bestE1 = e;
    }
    sessionVol += setVolume(s, t);
    if (!firstEver && !volumeAwarded && sessionVol > bestVol + 1e-9) {
      details.push({ kind: 'volume', value: sessionVol, previous: state.bestVolume, set: s });
      volumeAwarded = true;
    }
    if (details.length) hits.set(s.id, { setId: s.id, exerciseId, kinds: details.map((d) => d.kind), details });
  }
}

function completedStatSets(workout: Workout, exerciseId: string, countWarmups: boolean): WorkoutSet[] {
  return workout.exercises
    .filter((we) => we.exerciseId === exerciseId)
    .flatMap((we) => we.sets)
    .filter((s) => s.completed && countsInStats(s, countWarmups))
    .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0));
}

const exerciseIdsOf = (w: Workout) => [...new Set(w.exercises.map((we) => we.exerciseId))];

/**
 * Live PR detection for a workout (in progress or finished). Sets are replayed
 * in completion order against the best values from `history` (other finished
 * workouts that started before this one), so a later set in the same session
 * must also beat earlier ones. For an exercise with no prior history, the first
 * completed set is a best-set PR and every later set that beats it is too
 * (e1RM and volume need a baseline, so they start from the next session).
 */
export function detectPRs(
  workout: Workout,
  history: Workout[],
  trackingOf: (exerciseId: string) => TrackingType | undefined,
  countWarmups: boolean,
): Map<string, PRHit> {
  const hits = new Map<string, PRHit>();
  const prior = history.filter(
    (w) => w.id !== workout.id && w.finishedAt !== undefined && w.startedAt < workout.startedAt,
  );
  for (const exId of exerciseIdsOf(workout)) {
    const t = trackingOf(exId);
    if (!t) continue;
    replayExercise(exId, t, recordStateFrom(exId, t, prior, countWarmups), completedStatSets(workout, exId, countWarmups), hits);
  }
  return hits;
}

/**
 * Collapse a workout's PR hits into one PersonalRecord per exercise and kind:
 * the best value reached in the workout, and the record that stood before it.
 */
export function collapseHits(workout: Workout, hits: Map<string, PRHit>): PersonalRecord[] {
  const byKey = new Map<string, PersonalRecord>();
  for (const hit of hits.values()) {
    for (const d of hit.details) {
      const id = `${workout.id}:${hit.exerciseId}:${d.kind}`;
      const first = byKey.get(id);
      byKey.set(id, {
        id,
        exerciseId: hit.exerciseId,
        workoutId: workout.id,
        setId: d.set.id,
        kind: d.kind,
        value: d.value,
        previous: first ? first.previous : d.previous,
        set: pickValues(d.set),
        previousSet: first ? first.previousSet : d.previousSet && pickValues(d.previousSet),
        date: workout.startedAt,
      });
    }
  }
  return [...byKey.values()];
}

/** PersonalRecords broken in one workout, against earlier finished history. */
export function workoutPRRecords(
  workout: Workout,
  history: Workout[],
  trackingOf: (exerciseId: string) => TrackingType | undefined,
  countWarmups: boolean,
): PersonalRecord[] {
  return collapseHits(workout, detectPRs(workout, history, trackingOf, countWarmups));
}

/**
 * The full PR history: replays every finished workout in date order. Gives the
 * same result as calling workoutPRRecords on each workout, in linear time.
 */
export function buildPRHistory(
  workouts: Workout[],
  trackingOf: (exerciseId: string) => TrackingType | undefined,
  countWarmups: boolean,
): PersonalRecord[] {
  const out: PersonalRecord[] = [];
  const states = new Map<string, RecordState>();
  const finished = workouts.filter((w) => w.finishedAt !== undefined).sort((a, b) => a.startedAt - b.startedAt);
  // Workouts that start at the same moment don't count as each other's history.
  for (let i = 0; i < finished.length; ) {
    let j = i;
    while (j < finished.length && finished[j].startedAt === finished[i].startedAt) j++;
    const batch = finished.slice(i, j);
    for (const w of batch) {
      const hits = new Map<string, PRHit>();
      for (const exId of exerciseIdsOf(w)) {
        const t = trackingOf(exId);
        if (!t) continue;
        replayExercise(exId, t, states.get(exId) ?? { sessionCount: 0 }, completedStatSets(w, exId, countWarmups), hits);
      }
      out.push(...collapseHits(w, hits));
    }
    for (const w of batch) {
      for (const we of w.exercises) {
        const t = trackingOf(we.exerciseId);
        if (!t) continue;
        states.set(we.exerciseId, applySession(states.get(we.exerciseId) ?? { sessionCount: 0 }, statSets(we, countWarmups), t));
      }
    }
    i = j;
  }
  return out;
}
