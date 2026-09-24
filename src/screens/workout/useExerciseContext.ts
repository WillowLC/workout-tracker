// Derived per-exercise data for a workout: PREVIOUS rows, placeholders, BEST, PRs.
import { useMemo } from 'react';
import type { Settings, Template, Workout } from '../../domain/types';
import { findPreviousPerformance, placeholderFrom, previousForRows, type PreviousPerformance } from '../../domain/previous';
import { computeRecords, type ExerciseRecords } from '../../domain/records';
import { detectPRs } from '../../domain/prs';
import { templateTargetReps } from '../../domain/workoutOps';
import { useExerciseMap } from '../../store/selectors';

export function useWorkoutContext(w: Workout, history: Workout[], settings: Settings, template?: Template) {
  const exMap = useExerciseMap();
  const trackingOf = useMemo(() => (id: string) => exMap.get(id)?.trackingType, [exMap]);

  // History strictly before this workout (so editing past workouts shows what was "previous" then).
  const prior = useMemo(() => history.filter((h) => h.id !== w.id && h.finishedAt !== undefined && h.startedAt < w.startedAt), [history, w.id, w.startedAt]);

  const exerciseIds = useMemo(() => [...new Set(w.exercises.map((e) => e.exerciseId))].sort().join('|'), [w.exercises]);

  const perExercise = useMemo(() => {
    const map = new Map<string, { previous?: PreviousPerformance; records: ExerciseRecords }>();
    for (const id of exerciseIds.split('|').filter(Boolean)) {
      const t = trackingOf(id) ?? 'weight_reps';
      map.set(id, {
        previous: findPreviousPerformance(id, prior),
        records: computeRecords(id, t, prior, settings.countWarmupsInStats),
      });
    }
    return map;
  }, [exerciseIds, prior, trackingOf, settings.countWarmupsInStats]);

  const prs = useMemo(() => detectPRs(w, prior, trackingOf, settings.countWarmupsInStats), [w, prior, trackingOf, settings.countWarmupsInStats]);

  /** PREVIOUS set + placeholder values for every set row, keyed by set id. */
  const rows = useMemo(() => {
    const out = new Map<string, { previous?: ReturnType<typeof previousForRows>[number]; placeholder?: ReturnType<typeof placeholderFrom> }>();
    for (const we of w.exercises) {
      const prev = perExercise.get(we.exerciseId)?.previous;
      const matched = previousForRows(we.sets, prev?.sets);
      we.sets.forEach((s, i) => out.set(s.id, { previous: matched[i], placeholder: placeholderFrom(matched[i], templateTargetReps(template, we, i)) }));
    }
    return out;
  }, [w.exercises, perExercise, template]);

  return { exMap, trackingOf, prior, perExercise, prs, rows };
}
