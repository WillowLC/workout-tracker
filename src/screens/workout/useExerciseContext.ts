// Derived per-exercise data for a workout: PREVIOUS rows, placeholders, BEST,
// PRs, progression suggestion and plateau.
import { useMemo } from 'react';
import type { Settings, Template, Workout } from '../../domain/types';
import { placeholderFrom, previousForRows, previousSessions, type PreviousPerformance } from '../../domain/previous';
import { computeRecords, type ExerciseRecords } from '../../domain/records';
import { detectPRs } from '../../domain/prs';
import { templateTargetReps } from '../../domain/workoutOps';
import { effectiveRepRange, suggestProgression, type Suggestion } from '../../domain/progression';
import { effectiveStepKg } from '../../domain/weightSteps';
import { detectPlateau, type Plateau } from '../../domain/plateau';
import { useExerciseMap } from '../../store/selectors';

export interface ExerciseContext {
  /** Session PREVIOUS comes from (gym-aware). */
  previous?: PreviousPerformance;
  records: ExerciseRecords;
  suggestion: Suggestion | null;
  plateau: Plateau | null;
  stepKg: number;
}

export function useWorkoutContext(w: Workout, history: Workout[], settings: Settings, template?: Template) {
  const exMap = useExerciseMap();
  const trackingOf = useMemo(() => (id: string) => exMap.get(id)?.trackingType, [exMap]);

  // History strictly before this workout (so editing past workouts shows what was "previous" then).
  const prior = useMemo(() => history.filter((h) => h.id !== w.id && h.finishedAt !== undefined && h.startedAt < w.startedAt), [history, w.id, w.startedAt]);

  const exerciseIds = useMemo(() => [...new Set(w.exercises.map((e) => e.exerciseId))].sort().join('|'), [w.exercises]);

  const perExercise = useMemo(() => {
    const map = new Map<string, ExerciseContext>();
    // Plateaus are about "now" for the active workout, or the workout's own date when editing history.
    const asOf = w.finishedAt === undefined ? Date.now() : w.startedAt;
    for (const id of exerciseIds.split('|').filter(Boolean)) {
      const ex = exMap.get(id);
      const t = ex?.trackingType ?? 'weight_reps';
      const pool = previousSessions(id, prior, { gymId: w.gymId });
      const stepKg = effectiveStepKg(ex, settings);
      map.set(id, {
        previous: pool[0],
        records: computeRecords(id, t, prior, settings.countWarmupsInStats),
        suggestion: suggestProgression({ sessions: pool.slice(0, 2).map((s) => s.sets), range: effectiveRepRange(ex, template), stepKg, tracking: t }),
        plateau: detectPlateau(id, t, prior, settings.countWarmupsInStats, asOf),
        stepKg,
      });
    }
    return map;
  }, [exerciseIds, prior, exMap, settings, template, w.gymId, w.finishedAt, w.startedAt]);

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
