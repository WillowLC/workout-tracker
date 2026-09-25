// Plateau detection: an exercise done regularly whose records have stalled.
import type { TrackingType, Workout } from './types';
import { bestSetOf, compareSets, sessionsForExercise, setE1RM, statSets } from './records';
import { applySession, type RecordState } from './prs';
import { DAY_MS } from './muscles';

export const PLATEAU_WINDOW_DAYS = 42;
export const PLATEAU_MIN_SESSIONS = 4;
export const PLATEAU_RECENT_DAYS = 14;
export const PLATEAU_SNOOZE_DAYS = 28;

export interface Plateau {
  exerciseId: string;
  /** Sessions in the 6-week window. */
  sessions: number;
  /** Whole weeks since the last new best set or e1RM (at least 6). */
  weeks: number;
  lastSessionAt: number;
}

/**
 * Plateaued = at least 4 sessions in the last 6 weeks, no new best set
 * (weight-priority rule) and no new best e1RM in those 6 weeks, and the latest
 * session within the last 14 days. With no history before the window, the
 * window's first session is the baseline.
 */
export function detectPlateau(exerciseId: string, t: TrackingType, workouts: Workout[], countWarmups: boolean, now: number): Plateau | null {
  const windowStart = now - PLATEAU_WINDOW_DAYS * DAY_MS;
  const sessions = sessionsForExercise(exerciseId, workouts)
    .filter(({ workout, we }) => workout.startedAt <= now && statSets(we, countWarmups).length > 0)
    .reverse(); // oldest first
  const inWindow = sessions.filter(({ workout }) => workout.startedAt >= windowStart);
  if (inWindow.length < PLATEAU_MIN_SESSIONS) return null;
  const last = inWindow[inWindow.length - 1].workout.startedAt;
  if (now - last > PLATEAU_RECENT_DAYS * DAY_MS) return null;

  let state: RecordState = { sessionCount: 0 };
  let lastRecordAt = sessions[0].workout.startedAt;
  for (const { workout, we } of sessions) {
    const sets = statSets(we, countWarmups);
    const best = bestSetOf(sets, t);
    const e1 = Math.max(-Infinity, ...sets.map((s) => setE1RM(s, t) ?? -Infinity));
    const improved =
      state.sessionCount > 0 &&
      ((!!best && (!state.bestSet || compareSets(best, state.bestSet, t) > 0)) ||
        (e1 > -Infinity && (state.bestE1RM === undefined || e1 > state.bestE1RM + 1e-9)));
    if (improved) {
      lastRecordAt = workout.startedAt;
      if (workout.startedAt >= windowStart) return null;
    }
    state = applySession(state, sets, t);
  }
  return {
    exerciseId,
    sessions: inWindow.length,
    weeks: Math.max(6, Math.floor((now - lastRecordAt) / (7 * DAY_MS))),
    lastSessionAt: last,
  };
}

/** All plateaued exercises that aren't snoozed, most sessions first. */
export function detectPlateaus(
  exerciseIds: Iterable<string>,
  trackingOf: (id: string) => TrackingType | undefined,
  workouts: Workout[],
  countWarmups: boolean,
  now: number,
  snoozedUntil: Record<string, number> = {},
): Plateau[] {
  const out: Plateau[] = [];
  for (const id of exerciseIds) {
    if ((snoozedUntil[id] ?? 0) > now) continue;
    const t = trackingOf(id);
    if (!t) continue;
    const p = detectPlateau(id, t, workouts, countWarmups, now);
    if (p) out.push(p);
  }
  return out.sort((a, b) => b.weeks - a.weeks || b.sessions - a.sessions);
}

/** Exercise ids with at least one finished session in the last 6 weeks (the only plateau candidates). */
export function recentExerciseIds(workouts: Workout[], now: number): Set<string> {
  const start = now - PLATEAU_WINDOW_DAYS * DAY_MS;
  const ids = new Set<string>();
  for (const w of workouts) if (w.finishedAt !== undefined && w.startedAt >= start) for (const we of w.exercises) ids.add(we.exerciseId);
  return ids;
}

export const PLATEAU_IDEAS = [
  { title: 'Change the rep range', text: 'Move to a lower range with heavier weight (e.g. 5–8), or a higher one (12–15) for a few weeks.' },
  { title: 'Swap to a variation', text: 'Try a close cousin — dumbbell instead of barbell, incline instead of flat — then come back.' },
  { title: 'Take a lighter week', text: 'Drop the weight ~10% and cut a set for a week. Fatigue often hides strength.' },
  { title: 'Add a set', text: 'One more working set per session adds volume without changing the plan.' },
  { title: 'Check sleep and recovery', text: 'Short sleep, low protein or stress stall progress more than programming does.' },
];
