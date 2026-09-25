import type { Settings, TrackingType, WorkoutSet, SetValues } from '../domain/types';
import { formatClock, formatDistance, formatNumber, toDisplayWeight } from '../domain/units';

/** Compact text for a set, e.g. "80 kg × 8", "-20 kg × 8", "12 reps", "5 km · 25:00". */
export function formatSet(s: SetValues | undefined, t: TrackingType, unit: Settings['unit']): string {
  if (!s) return '—';
  const w = s.weight !== undefined ? formatNumber(toDisplayWeight(s.weight, unit)) : undefined;
  switch (t) {
    case 'weight_reps':
      return w !== undefined && s.reps !== undefined ? `${w} ${unit} × ${s.reps}` : '—';
    case 'weighted_bodyweight':
      return s.reps !== undefined ? `+${w ?? 0} ${unit} × ${s.reps}` : '—';
    case 'assisted_bodyweight':
      return s.reps !== undefined ? `-${w ?? 0} ${unit} × ${s.reps}` : '—';
    case 'reps_only':
      return s.reps !== undefined ? `${s.reps} reps` : '—';
    case 'duration':
      return s.durationSec !== undefined ? formatClock(s.durationSec) : '—';
    case 'distance_duration': {
      const parts = [s.distanceM !== undefined ? formatDistance(s.distanceM) : undefined, s.durationSec !== undefined ? formatClock(s.durationSec) : undefined].filter(Boolean);
      return parts.length ? parts.join(' · ') : '—';
    }
  }
}

export function formatSetWithRpe(s: WorkoutSet, t: TrackingType, unit: Settings['unit']): string {
  const base = formatSet(s, t, unit);
  return s.rpe !== undefined ? `${base} @ ${s.rpe}` : base;
}

export function formatDate(ts: number, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }): string {
  return new Date(ts).toLocaleDateString(undefined, opts);
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function relativeDays(ts: number, now = Date.now()): string {
  const days = Math.floor((now - ts) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return formatDate(ts, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Calendar days between a timestamp and now, e.g. "Today", "Yesterday", "12 days ago". */
export function daysAgo(ts: number, now = Date.now()): string {
  const midnight = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const days = Math.round((midnight(now) - midnight(ts)) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export function columnsFor(t: TrackingType, unit: Settings['unit']): { key: 'weight' | 'reps' | 'durationSec' | 'distanceM'; label: string }[] {
  switch (t) {
    case 'weight_reps':
      return [{ key: 'weight', label: unit.toUpperCase() }, { key: 'reps', label: 'REPS' }];
    case 'weighted_bodyweight':
      return [{ key: 'weight', label: `+${unit.toUpperCase()}` }, { key: 'reps', label: 'REPS' }];
    case 'assisted_bodyweight':
      return [{ key: 'weight', label: `-${unit.toUpperCase()}` }, { key: 'reps', label: 'REPS' }];
    case 'reps_only':
      return [{ key: 'reps', label: 'REPS' }];
    case 'duration':
      return [{ key: 'durationSec', label: 'TIME' }];
    case 'distance_duration':
      return [{ key: 'distanceM', label: 'KM' }, { key: 'durationSec', label: 'TIME' }];
  }
}

/** "80 kg" with one decimal max, in the user's unit. */
export function formatKg(kg: number, unit: Settings['unit']): string {
  return `${formatNumber(Math.round(toDisplayWeight(kg, unit) * 10) / 10)} ${unit}`;
}

/** Session volume in the exercise's own terms (kg, reps, time or distance). */
export function formatExerciseVolume(v: number, t: TrackingType, unit: Settings['unit']): string {
  if (t === 'weight_reps' || t === 'weighted_bodyweight') return `${Math.round(toDisplayWeight(v, unit)).toLocaleString('en-US')} ${unit}`;
  if (t === 'duration') return formatClock(v);
  if (t === 'distance_duration') return formatDistance(v);
  return `${v} reps`;
}

export interface PRText {
  label: string;
  value: string;
  /** Undefined = first ever. */
  was?: string;
}

/** Display text for a PR: new value and what it beat. */
export function formatPR(
  pr: { kind: 'weight' | 'e1rm' | 'volume'; value: number; previous?: number; set: SetValues; previousSet?: SetValues },
  t: TrackingType,
  unit: Settings['unit'],
): PRText {
  switch (pr.kind) {
    case 'weight':
      return { label: 'Best set', value: formatSet(pr.set, t, unit), was: pr.previousSet ? formatSet(pr.previousSet, t, unit) : undefined };
    case 'e1rm':
      return { label: 'e1RM', value: formatKg(pr.value, unit), was: pr.previous !== undefined ? formatKg(pr.previous, unit) : undefined };
    case 'volume':
      return { label: 'Volume', value: formatExerciseVolume(pr.value, t, unit), was: pr.previous !== undefined ? formatExerciseVolume(pr.previous, t, unit) : undefined };
  }
}
