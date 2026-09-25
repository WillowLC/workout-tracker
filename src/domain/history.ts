import type { Workout } from './types';

export function groupByMonth(workouts: Workout[]): [string, Workout[]][] {
  const map = new Map<string, Workout[]>();
  for (const w of [...workouts].sort((a, b) => b.startedAt - a.startedAt)) {
    const k = new Date(w.startedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(w);
  }
  return [...map.entries()];
}

export function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export interface CalendarDay {
  /** Local noon of the day (stable across DST). */
  date: number;
  /** Workouts started that day, oldest first. */
  workouts: Workout[];
  /** After `now` — drawn empty. */
  future: boolean;
}

/** Finished workouts keyed by local day, each list oldest first. */
export function workoutsByDay(workouts: Workout[]): Map<string, Workout[]> {
  const map = new Map<string, Workout[]>();
  for (const w of [...workouts].sort((a, b) => a.startedAt - b.startedAt)) {
    const k = dayKey(w.startedAt);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(w);
  }
  return map;
}

function noon(ts: number): Date {
  const d = new Date(ts);
  d.setHours(12, 0, 0, 0);
  return d;
}

/** Monday of the week containing `ts`, at local noon. */
export function startOfWeek(ts: number): Date {
  const d = noon(ts);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function calendarDay(day: Date, byDay: Map<string, Workout[]>, now: number): CalendarDay {
  const future = day.getTime() > noon(now).getTime();
  return { date: day.getTime(), workouts: future ? [] : byDay.get(dayKey(day.getTime())) ?? [], future };
}

/** The last `weeks` calendar weeks (Mon..Sun rows), oldest first, ending with the current week. */
export function recentWeeks(byDay: Map<string, Workout[]>, now: number, weeks = 3): CalendarDay[][] {
  const start = startOfWeek(now);
  start.setDate(start.getDate() - (weeks - 1) * 7);
  return Array.from({ length: weeks }, (_, wk) =>
    Array.from({ length: 7 }, (_, d) => {
      const day = new Date(start);
      day.setDate(start.getDate() + wk * 7 + d);
      return calendarDay(day, byDay, now);
    }),
  );
}

/** One month as Mon..Sun week rows; days outside the month are `null`. `month` is 0-based. */
export function monthGrid(year: number, month: number, byDay: Map<string, Workout[]>, now: number): (CalendarDay | null)[][] {
  const first = new Date(year, month, 1, 12);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (CalendarDay | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= days; d++) cells.push(calendarDay(new Date(year, month, d, 12), byDay, now));
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
}

/** Months from the current one back to the month of the earliest workout, newest first. */
export function monthsBack(workouts: Workout[], now: number): { year: number; month: number }[] {
  const end = new Date(now);
  const earliest = workouts.reduce((m, w) => Math.min(m, w.startedAt), now);
  const cur = new Date(new Date(earliest).getFullYear(), new Date(earliest).getMonth(), 1);
  const out: { year: number; month: number }[] = [];
  while (cur.getFullYear() < end.getFullYear() || (cur.getFullYear() === end.getFullYear() && cur.getMonth() <= end.getMonth())) {
    out.push({ year: cur.getFullYear(), month: cur.getMonth() });
    cur.setMonth(cur.getMonth() + 1);
  }
  return out.reverse();
}
