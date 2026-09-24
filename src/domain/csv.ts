import type { Exercise, Settings, Workout } from './types';
import { sortedExercises } from './superset';
import { toDisplayWeight } from './units';

const SET_TYPE_LABEL = { normal: 'Normal', warmup: 'Warm Up', drop: 'Drop Set', failure: 'Failure' } as const;

function esc(v: string | number | undefined): string {
  if (v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function isoLocal(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** Strong-compatible-ish CSV: one row per completed set. Weight in the user's unit. */
export function workoutsToCsv(workouts: Workout[], exercises: Map<string, Exercise>, unit: Settings['unit']): string {
  const header = ['Date', 'Workout Name', 'Duration', 'Exercise Name', 'Set Order', 'Set Type', `Weight (${unit})`, 'Reps', 'Distance (m)', 'Seconds', 'RPE', 'Notes'];
  const rows = [header.join(',')];
  const finished = workouts.filter((w) => w.finishedAt).sort((a, b) => a.startedAt - b.startedAt);
  for (const w of finished) {
    const durMin = Math.round(((w.finishedAt ?? w.startedAt) - w.startedAt) / 60000);
    for (const we of sortedExercises(w)) {
      const name = exercises.get(we.exerciseId)?.name ?? we.exerciseId;
      we.sets.forEach((s, i) => {
        rows.push(
          [
            isoLocal(w.startedAt), w.name, `${durMin}m`, name, i + 1, SET_TYPE_LABEL[s.type],
            s.weight !== undefined ? toDisplayWeight(s.weight, unit) : undefined,
            s.reps, s.distanceM, s.durationSec, s.rpe, we.sessionNote ?? w.note,
          ].map(esc).join(','),
        );
      });
    }
  }
  return rows.join('\n') + '\n';
}
