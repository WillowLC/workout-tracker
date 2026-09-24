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

/** Last `weeks` weeks as columns of 7 days (Mon..Sun), each with a workout count. */
export function trainingHeatmap(workouts: Workout[], now: number, weeks = 16): { date: number; count: number }[][] {
  const counts = new Map<string, number>();
  for (const w of workouts) counts.set(dayKey(w.startedAt), (counts.get(dayKey(w.startedAt)) ?? 0) + 1);
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  const dow = (today.getDay() + 6) % 7; // Monday = 0
  const start = new Date(today);
  start.setDate(today.getDate() - dow - (weeks - 1) * 7);
  const cols: { date: number; count: number }[][] = [];
  for (let wk = 0; wk < weeks; wk++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + wk * 7 + d);
      col.push({ date: day.getTime(), count: day > today ? -1 : counts.get(dayKey(day.getTime())) ?? 0 });
    }
    cols.push(col);
  }
  return cols;
}
