// Monthly recap and "Year in Lifting": pure aggregation over a date range.
import type { Exercise, Gym, Muscle, PersonalRecord, SetValues, Settings, TrackingType, Workout } from './types';
import { MUSCLES } from './types';
import { compareSets, computeRecords, hasLoadVolume, statSets, workoutVolume } from './records';
import { monthPeriod, muscleSets, type MuscleSets, type Period, weekPeriod, yearPeriod, periodWeeks } from './muscles';

export type RecapKind = 'month' | 'year';

export interface RecapRef {
  kind: RecapKind;
  year: number;
  /** 0-based; months only. */
  month?: number;
}

export const recapKey = (r: RecapRef) => (r.kind === 'month' ? `${r.year}-${String(r.month! + 1).padStart(2, '0')}` : String(r.year));

export function parseRecapKey(key: string): RecapRef | undefined {
  const m = /^(\d{4})(?:-(\d{2}))?$/.exec(key);
  if (!m) return undefined;
  return m[2] ? { kind: 'month', year: Number(m[1]), month: Number(m[2]) - 1 } : { kind: 'year', year: Number(m[1]) };
}

export function recapPeriod(r: RecapRef): Period {
  return r.kind === 'month' ? monthPeriod(r.year, r.month!) : yearPeriod(r.year);
}

const monthName = (m: number) => new Date(2000, m, 1).toLocaleDateString('en-US', { month: 'long' });

export function recapTitle(r: RecapRef, now: number): string {
  const p = recapPeriod(r);
  if (r.kind === 'month') return `Your ${monthName(r.month!)} in lifting`;
  return now < p.end ? `Your ${r.year} so far` : `Your ${r.year} in lifting`;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening';
export const timeOfDay = (ts: number): TimeOfDay => {
  const h = new Date(ts).getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
};

export interface RecapData {
  ref: RecapRef;
  period: Period;
  /** The period isn't over yet (e.g. "Your 2026 so far"); stats run to `now`. */
  partial: boolean;
  workouts: number;
  totalTimeMs: number;
  sets: number;
  reps: number;
  volumeKg: number;
  /** % change vs the previous period (same length); null when the previous period had none. */
  change: { workouts: number | null; volume: number | null; sets: number | null };
  prCount: number;
  biggestJump?: { exerciseId: string; from: number; to: number; pct: number; workoutId: string };
  heaviestSet?: { exerciseId: string; set: SetValues; workoutId: string; date: number };
  topExercise?: { exerciseId: string; sets: number };
  topMuscle?: { muscle: Muscle; sets: number };
  /** 0 = Monday. */
  favouriteDay?: number;
  favouriteTime?: TimeOfDay;
  longestWeekStreak: number;
  /** Only when more than one gym was used. */
  topGym?: { gymId: string; name: string; workouts: number };
  muscleSets: Record<Muscle, MuscleSets>;
  /** Weeks in the period, for per-week averages on the muscle map. */
  weeks: number;
  // Year only
  monthlyVolume?: { month: number; volumeKg: number }[];
  topExercises?: { exerciseId: string; sets: number }[];
  vsYearAgo?: { exerciseId: string; now?: number; then?: number }[];
}

export interface RecapContext {
  workouts: Workout[];
  exMap: Map<string, Exercise>;
  prs: PersonalRecord[];
  gyms: Gym[];
  settings: Pick<Settings, 'countWarmupsInStats'>;
}

const pctChange = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);

function basics(ws: Workout[], trackingOf: (id: string) => TrackingType | undefined, cw: boolean) {
  let sets = 0;
  let reps = 0;
  let volumeKg = 0;
  let totalTimeMs = 0;
  for (const w of ws) {
    totalTimeMs += Math.max(0, (w.finishedAt ?? w.startedAt) - w.startedAt);
    volumeKg += workoutVolume(w, trackingOf, cw);
    for (const we of w.exercises) {
      const ss = statSets(we, cw);
      sets += ss.length;
      reps += ss.reduce((a, s) => a + (s.reps ?? 0), 0);
    }
  }
  return { workouts: ws.length, sets, reps, volumeKg, totalTimeMs };
}

const argmax = <K>(m: Map<K, number>): [K, number] | undefined => {
  let best: [K, number] | undefined;
  for (const [k, v] of m) if (!best || v > best[1]) best = [k, v];
  return best;
};

/** Longest run of consecutive Monday-to-Sunday weeks with at least one workout. */
export function longestWeekStreak(ws: Workout[], period: Period): number {
  const trained = new Set(ws.map((w) => weekPeriod(w.startedAt).start));
  let best = 0;
  let run = 0;
  for (let i = 0; ; i++) {
    const wk = weekPeriod(period.start, i);
    if (wk.start >= period.end) break;
    run = trained.has(wk.start) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

export function computeRecap(ref: RecapRef, ctx: RecapContext, now: number): RecapData {
  const full = recapPeriod(ref);
  const partial = now < full.end;
  const period: Period = { start: full.start, end: Math.min(full.end, Math.max(full.start, now)) };
  const cw = ctx.settings.countWarmupsInStats;
  const trackingOf = (id: string) => ctx.exMap.get(id)?.trackingType;
  const finished = ctx.workouts.filter((w) => w.finishedAt !== undefined);
  const inP = (p: Period) => finished.filter((w) => w.startedAt >= p.start && w.startedAt < p.end);
  const ws = inP(period);

  // Previous period of the same length (a "so far" year compares with the same dates last year).
  const prevFull = ref.kind === 'month' ? monthPeriod(ref.year, ref.month! - 1) : yearPeriod(ref.year - 1);
  let prevEnd = prevFull.end;
  if (partial && ref.kind === 'month') prevEnd = Math.min(prevFull.end, prevFull.start + (period.end - period.start));
  if (partial && ref.kind === 'year') prevEnd = new Date(period.end).setFullYear(new Date(period.end).getFullYear() - 1);
  const prevPeriod: Period = { start: prevFull.start, end: prevEnd };

  const cur = basics(ws, trackingOf, cw);
  const prev = basics(inP(prevPeriod), trackingOf, cw);

  const prsIn = ctx.prs.filter((p) => p.date >= period.start && p.date < period.end);
  let biggestJump: RecapData['biggestJump'];
  for (const p of prsIn) {
    if (p.kind !== 'e1rm' || !p.previous) continue;
    const pct = ((p.value - p.previous) / p.previous) * 100;
    if (!biggestJump || pct > biggestJump.pct) biggestJump = { exerciseId: p.exerciseId, from: p.previous, to: p.value, pct, workoutId: p.workoutId };
  }

  let heaviestSet: RecapData['heaviestSet'];
  const exSets = new Map<string, number>();
  const days = new Map<number, number>();
  const times = new Map<TimeOfDay, number>();
  const gymCount = new Map<string, number>();
  for (const w of ws) {
    days.set((new Date(w.startedAt).getDay() + 6) % 7, (days.get((new Date(w.startedAt).getDay() + 6) % 7) ?? 0) + 1);
    times.set(timeOfDay(w.startedAt), (times.get(timeOfDay(w.startedAt)) ?? 0) + 1);
    if (w.gymId) gymCount.set(w.gymId, (gymCount.get(w.gymId) ?? 0) + 1);
    for (const we of w.exercises) {
      const ss = statSets(we, cw);
      if (!ss.length) continue;
      exSets.set(we.exerciseId, (exSets.get(we.exerciseId) ?? 0) + ss.length);
      if (trackingOf(we.exerciseId) !== 'weight_reps') continue;
      for (const s of ss) {
        if (s.weight === undefined || !s.reps) continue;
        if (!heaviestSet || compareSets(s, heaviestSet.set as never, 'weight_reps') > 0) {
          heaviestSet = { exerciseId: we.exerciseId, set: { weight: s.weight, reps: s.reps }, workoutId: w.id, date: w.startedAt };
        }
      }
    }
  }
  const mSets = muscleSets(ws, ctx.exMap, cw);
  const topMuscleEntry = MUSCLES.map((m) => [m, mSets[m].total] as const).sort((a, b) => b[1] - a[1])[0];
  const topEx = argmax(exSets);
  const topGymEntry = gymCount.size > 1 ? argmax(gymCount) : undefined;
  const favDay = argmax(days);
  const favTime = argmax(times);

  const data: RecapData = {
    ref,
    period,
    partial,
    ...cur,
    change: { workouts: pctChange(cur.workouts, prev.workouts), volume: pctChange(cur.volumeKg, prev.volumeKg), sets: pctChange(cur.sets, prev.sets) },
    prCount: prsIn.length,
    biggestJump,
    heaviestSet,
    topExercise: topEx && { exerciseId: topEx[0], sets: topEx[1] },
    topMuscle: topMuscleEntry && topMuscleEntry[1] > 0 ? { muscle: topMuscleEntry[0], sets: topMuscleEntry[1] } : undefined,
    favouriteDay: favDay?.[0],
    favouriteTime: favTime?.[0],
    longestWeekStreak: longestWeekStreak(ws, period),
    topGym: topGymEntry && { gymId: topGymEntry[0], name: ctx.gyms.find((g) => g.id === topGymEntry[0])?.name ?? 'Unknown gym', workouts: topGymEntry[1] },
    muscleSets: mSets,
    weeks: periodWeeks(period),
  };

  if (ref.kind === 'year') {
    data.monthlyVolume = Array.from({ length: 12 }, (_, m) => ({
      month: m,
      volumeKg: basics(inP(monthPeriod(ref.year, m)), trackingOf, cw).volumeKg,
    }));
    const ranked = [...exSets.entries()].sort((a, b) => b[1] - a[1]);
    data.topExercises = ranked.slice(0, 5).map(([exerciseId, sets]) => ({ exerciseId, sets }));
    const lifts = ranked.filter(([id]) => {
      const t = trackingOf(id);
      return t && hasLoadVolume(t);
    }).slice(0, 3);
    const yearAgo = new Date(period.end);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    data.vsYearAgo = lifts.map(([id]) => {
      const t = trackingOf(id)!;
      const upTo = (end: number) => computeRecords(id, t, finished.filter((w) => w.startedAt < end), cw).bestE1RM;
      return { exerciseId: id, now: upTo(period.end), then: upTo(yearAgo.getTime()) };
    });
  }
  return data;
}

/** Every month and year with at least one finished workout, newest first. */
export function availableRecaps(workouts: Workout[]): { months: RecapRef[]; years: RecapRef[] } {
  const months = new Map<string, RecapRef>();
  const years = new Map<number, RecapRef>();
  for (const w of workouts) {
    if (w.finishedAt === undefined) continue;
    const d = new Date(w.startedAt);
    const ref: RecapRef = { kind: 'month', year: d.getFullYear(), month: d.getMonth() };
    months.set(recapKey(ref), ref);
    years.set(d.getFullYear(), { kind: 'year', year: d.getFullYear() });
  }
  const sortKey = (r: RecapRef) => r.year * 12 + (r.month ?? 0);
  return {
    months: [...months.values()].sort((a, b) => sortKey(b) - sortKey(a)),
    years: [...years.values()].sort((a, b) => b.year - a.year),
  };
}

export interface DueRecap {
  ref: RecapRef;
  /** Key used to remember a dismissal. */
  dismissKey: string;
  title: string;
}

/**
 * Recap cards to show on the home dashboard:
 * - the previous month's recap throughout the current month (if it had workouts);
 * - in December, "Your YEAR so far";
 * - in January, the previous year's full recap.
 */
export function dueRecaps(workouts: Workout[], now: number, dismissed: string[] = []): DueRecap[] {
  const d = new Date(now);
  const y = d.getFullYear();
  const m = d.getMonth();
  const out: DueRecap[] = [];
  const has = (p: Period) => workouts.some((w) => w.finishedAt !== undefined && w.startedAt >= p.start && w.startedAt < p.end);

  if (m === 11 && has(yearPeriod(y))) out.push({ ref: { kind: 'year', year: y }, dismissKey: `yearsofar:${y}`, title: `Your ${y} so far` });
  if (m === 0 && has(yearPeriod(y - 1))) out.push({ ref: { kind: 'year', year: y - 1 }, dismissKey: `year:${y - 1}`, title: `Your ${y - 1} in lifting` });
  const prevMonth: RecapRef = m === 0 ? { kind: 'month', year: y - 1, month: 11 } : { kind: 'month', year: y, month: m - 1 };
  if (has(recapPeriod(prevMonth))) out.push({ ref: prevMonth, dismissKey: `month:${recapKey(prevMonth)}`, title: recapTitle(prevMonth, now) });
  return out.filter((r) => !dismissed.includes(r.dismissKey));
}
