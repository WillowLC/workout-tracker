import { useMemo } from 'react';
import { useAppStore } from './appStore';
import type { Exercise, TrackingType } from '../domain/types';

export function useExerciseMap(): Map<string, Exercise> {
  const exercises = useAppStore((s) => s.exercises);
  return useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
}

export function useTrackingOf(): (id: string) => TrackingType | undefined {
  const map = useExerciseMap();
  return useMemo(() => (id: string) => map.get(id)?.trackingType, [map]);
}

/** Exercise ids by most recent use (finished workouts). */
export function useRecentExerciseIds(limit = 8): string[] {
  const workouts = useAppStore((s) => s.workouts);
  return useMemo(() => {
    const last = new Map<string, number>();
    for (const w of workouts) for (const we of w.exercises) last.set(we.exerciseId, Math.max(last.get(we.exerciseId) ?? 0, w.startedAt));
    return [...last.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([id]) => id);
  }, [workouts, limit]);
}
