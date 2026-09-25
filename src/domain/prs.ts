import type { TrackingType, Workout, WorkoutSet } from './types';
import { compareSets, computeRecords, setE1RM, setVolume } from './records';
import { countsInStats } from './sets';

export type PRKind = 'weight' | 'e1rm' | 'volume';

export const PR_LABELS: Record<PRKind, string> = {
  weight: 'Best set',
  e1rm: 'Est. 1RM',
  volume: 'Volume',
};

/** A completed set with at least one logged number (a blank set is never a record). */
function hasValue(s: WorkoutSet): boolean {
  return [s.weight, s.reps, s.durationSec, s.distanceM].some((v) => v !== undefined && v > 0);
}

export interface PRHit {
  setId: string;
  exerciseId: string;
  kinds: PRKind[];
}

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
  const exerciseIds = [...new Set(workout.exercises.map((we) => we.exerciseId))];

  for (const exId of exerciseIds) {
    const t = trackingOf(exId);
    if (!t) continue;
    const rec = computeRecords(exId, t, prior, countWarmups);
    const firstEver = !rec.sessionCount || !rec.bestSet;

    let bestSet: WorkoutSet | undefined = firstEver ? undefined : rec.bestSet;
    let bestE1 = firstEver ? undefined : rec.bestE1RM;
    const bestVol = rec.bestVolume ?? 0;
    let sessionVol = 0;
    let volumeAwarded = false;

    const sets = workout.exercises
      .filter((we) => we.exerciseId === exId)
      .flatMap((we) => we.sets)
      .filter((s) => s.completed && countsInStats(s, countWarmups))
      .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0));

    for (const s of sets) {
      const kinds: PRKind[] = [];
      if (bestSet ? compareSets(s, bestSet, t) > 0 : hasValue(s)) {
        kinds.push('weight');
        bestSet = s;
      }
      const e = setE1RM(s, t);
      if (e !== undefined && (bestE1 === undefined || e > bestE1 + 1e-9)) {
        if (bestE1 !== undefined && !firstEver) kinds.push('e1rm');
        bestE1 = e;
      }
      sessionVol += setVolume(s, t);
      if (!firstEver && !volumeAwarded && sessionVol > bestVol + 1e-9) {
        kinds.push('volume');
        volumeAwarded = true;
      }
      if (kinds.length) hits.set(s.id, { setId: s.id, exerciseId: exId, kinds });
    }
  }
  return hits;
}
