// Sets per muscle, weekly targets, and muscle-map shading levels.
import type { Exercise, Muscle, RepRange, Settings, Workout } from './types';
import { MUSCLES } from './types';
import { countsInStats } from './sets';

export const MUSCLE_LABELS: Record<Muscle, string> = {
  chest: 'Chest',
  front_delts: 'Front delts',
  side_delts: 'Side delts',
  rear_delts: 'Rear delts',
  lats: 'Lats',
  upper_back: 'Upper back',
  traps: 'Traps',
  lower_back: 'Lower back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  adductors: 'Adductors',
  abductors: 'Abductors',
  calves: 'Calves',
};

export const DAY_MS = 86_400_000;

export interface Period {
  /** Inclusive start (ms). */
  start: number;
  /** Exclusive end (ms). */
  end: number;
}

/** Monday 00:00 local of the week containing `ts`, to the next Monday 00:00. */
export function weekPeriod(ts: number, offsetWeeks = 0): Period {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) + offsetWeeks * 7);
  const end = new Date(d);
  end.setDate(end.getDate() + 7);
  return { start: d.getTime(), end: end.getTime() };
}

export function monthPeriod(year: number, month: number): Period {
  return { start: new Date(year, month, 1).getTime(), end: new Date(year, month + 1, 1).getTime() };
}

export function yearPeriod(year: number): Period {
  return { start: new Date(year, 0, 1).getTime(), end: new Date(year + 1, 0, 1).getTime() };
}

/** Length of a period in weeks (at least 1), for per-week averages. */
export function periodWeeks(p: Period): number {
  return Math.max(1, Math.round((p.end - p.start) / DAY_MS) / 7);
}

export const inPeriod = (ts: number, p: Period) => ts >= p.start && ts < p.end;

export interface MuscleSets {
  primary: number;
  secondary: number;
  /** primary + 0.5 × secondary */
  total: number;
}

const zero = (): Record<Muscle, MuscleSets> => Object.fromEntries(MUSCLES.map((m) => [m, { primary: 0, secondary: 0, total: 0 }])) as Record<Muscle, MuscleSets>;

/** Cardio doesn't count toward weekly sets (it still counts for recency). */
const countsForSets = (e: Exercise | undefined) => !!e && e.bodyPart !== 'Cardio';

/** Working sets = completed normal, failure and drop sets (+ warm-ups if counted in stats). */
export function workingSetCount(w: Workout, exerciseId: string | undefined, countWarmups: boolean): number {
  let n = 0;
  for (const we of w.exercises) {
    if (exerciseId && we.exerciseId !== exerciseId) continue;
    n += we.sets.filter((s) => s.completed && countsInStats(s, countWarmups)).length;
  }
  return n;
}

/**
 * Sets per muscle over finished workouts in a period: each working set adds 1
 * to each of the exercise's primary muscles and 0.5 to each secondary one.
 */
export function muscleSets(workouts: Workout[], exMap: Map<string, Exercise>, countWarmups: boolean, period?: Period): Record<Muscle, MuscleSets> {
  const out = zero();
  for (const w of workouts) {
    if (w.finishedAt === undefined || (period && !inPeriod(w.startedAt, period))) continue;
    for (const we of w.exercises) {
      const ex = exMap.get(we.exerciseId);
      if (!countsForSets(ex)) continue;
      const n = we.sets.filter((s) => s.completed && countsInStats(s, countWarmups)).length;
      if (!n) continue;
      for (const m of ex!.primaryMuscles ?? []) out[m].primary += n;
      for (const m of ex!.secondaryMuscles ?? []) out[m].secondary += n;
    }
  }
  for (const m of MUSCLES) out[m].total = out[m].primary + out[m].secondary * 0.5;
  return out;
}

export function targetFor(m: Muscle, s: Pick<Settings, 'weeklySetTarget' | 'muscleTargets'>): RepRange {
  return s.muscleTargets?.[m] ?? s.weeklySetTarget;
}

export type MuscleStatus = 'none' | 'under' | 'in' | 'over';

export function muscleStatus(sets: number, target: RepRange): MuscleStatus {
  if (sets <= 0) return 'none';
  if (sets < target.min) return 'under';
  if (sets > target.max) return 'over';
  return 'in';
}

export interface WeeklyMuscleRow {
  muscle: Muscle;
  sets: number;
  target: RepRange;
  status: MuscleStatus;
}

/** Muscles sorted by sets (desc), then in list order; zero-set muscles last. */
export function weeklyRows(sets: Record<Muscle, MuscleSets>, s: Pick<Settings, 'weeklySetTarget' | 'muscleTargets'>): WeeklyMuscleRow[] {
  return MUSCLES.map((m, i) => ({ m, i }))
    .map(({ m, i }) => ({ row: { muscle: m, sets: sets[m].total, target: targetFor(m, s), status: muscleStatus(sets[m].total, targetFor(m, s)) }, i }))
    .sort((a, b) => b.row.sets - a.row.sets || a.i - b.i)
    .map(({ row }) => row);
}

/** 0–4 heat level for the Volume map: none, under half of min, under min, in range, over max. */
export function volumeLevel(setsPerWeek: number, target: RepRange): 0 | 1 | 2 | 3 | 4 {
  if (setsPerWeek <= 0) return 0;
  if (setsPerWeek < target.min / 2) return 1;
  if (setsPerWeek < target.min) return 2;
  if (setsPerWeek <= target.max) return 3;
  return 4;
}

/** 0–4 heat level for the Recency map: never, 10+ days, 6–9, 3–5, 0–2. */
export function recencyLevel(days: number | undefined): 0 | 1 | 2 | 3 | 4 {
  if (days === undefined) return 0;
  if (days <= 2) return 4;
  if (days <= 5) return 3;
  if (days <= 9) return 2;
  return 1;
}

/** Calendar days between two timestamps (local midnights). */
export function calendarDaysBetween(from: number, to: number): number {
  const a = new Date(from);
  a.setHours(0, 0, 0, 0);
  const b = new Date(to);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

/** When each muscle was last trained (primary or secondary), in finished workouts before `before`. */
export function lastTrained(workouts: Workout[], exMap: Map<string, Exercise>, before = Infinity): Partial<Record<Muscle, number>> {
  const out: Partial<Record<Muscle, number>> = {};
  for (const w of workouts) {
    if (w.finishedAt === undefined || w.startedAt >= before) continue;
    for (const we of w.exercises) {
      if (!we.sets.some((s) => s.completed)) continue;
      const ex = exMap.get(we.exerciseId);
      for (const m of [...(ex?.primaryMuscles ?? []), ...(ex?.secondaryMuscles ?? [])]) out[m] = Math.max(out[m] ?? 0, w.startedAt);
    }
  }
  return out;
}

export interface MuscleExercise {
  exerciseId: string;
  role: 'primary' | 'secondary';
  sets: number;
}

/** Exercises that hit a muscle in a period, by sets (desc). */
export function exercisesForMuscle(workouts: Workout[], exMap: Map<string, Exercise>, muscle: Muscle, countWarmups: boolean, period?: Period): MuscleExercise[] {
  const map = new Map<string, MuscleExercise>();
  for (const w of workouts) {
    if (w.finishedAt === undefined || (period && !inPeriod(w.startedAt, period))) continue;
    for (const we of w.exercises) {
      const ex = exMap.get(we.exerciseId);
      if (!ex) continue;
      const role = ex.primaryMuscles?.includes(muscle) ? 'primary' : ex.secondaryMuscles?.includes(muscle) ? 'secondary' : undefined;
      if (!role) continue;
      const n = we.sets.filter((s) => s.completed && countsInStats(s, countWarmups)).length;
      if (!n) continue;
      const cur = map.get(ex.id) ?? { exerciseId: ex.id, role, sets: 0 };
      cur.sets += n;
      map.set(ex.id, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.sets - a.sets);
}

/** Weekly set totals for one muscle over the last `weeks` weeks (oldest first, ending with the week of `now`). */
export function muscleTrend(workouts: Workout[], exMap: Map<string, Exercise>, muscle: Muscle, countWarmups: boolean, now: number, weeks = 12): { start: number; sets: number }[] {
  return Array.from({ length: weeks }, (_, i) => {
    const p = weekPeriod(now, i - (weeks - 1));
    return { start: p.start, sets: muscleSets(workouts, exMap, countWarmups, p)[muscle].total };
  });
}

/** Custom exercises that were never tagged with muscles. */
export function untaggedCustomExercises(exercises: Exercise[]): Exercise[] {
  return exercises.filter((e) => e.isCustom && !e.archived && !(e.primaryMuscles?.length));
}

/**
 * Volume-mode shading: average weekly sets over the period vs each muscle's
 * target. `weeks` may be below 1 (a single workout counts as half a week).
 */
export function volumeLevels(sets: Record<Muscle, MuscleSets>, weeks: number, s: Pick<Settings, 'weeklySetTarget' | 'muscleTargets'>): Record<Muscle, 0 | 1 | 2 | 3 | 4> {
  return Object.fromEntries(MUSCLES.map((m) => [m, volumeLevel(sets[m].total / (weeks > 0 ? weeks : 1), targetFor(m, s))])) as Record<Muscle, 0 | 1 | 2 | 3 | 4>;
}

/** Recency-mode shading: days since each muscle was last trained, as of `asOf`. */
export function recencyLevels(last: Partial<Record<Muscle, number>>, asOf: number): Record<Muscle, 0 | 1 | 2 | 3 | 4> {
  return Object.fromEntries(MUSCLES.map((m) => [m, recencyLevel(last[m] === undefined ? undefined : calendarDaysBetween(last[m]!, asOf))])) as Record<Muscle, 0 | 1 | 2 | 3 | 4>;
}
