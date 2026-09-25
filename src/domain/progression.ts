// Double progression: rep ranges and next-session weight suggestions.
import type { Exercise, RepRange, Template, TrackingType, WorkoutSet } from './types';
import { usesWeight } from './records';
import { roundToStep } from './weightSteps';

/** "Big barbell compounds" get 5–8. Matched on the movement name. */
const BIG_COMPOUND = /^(squat|front squat|box squat|bench press|incline bench press|decline bench press|close grip bench press|floor press|deadlift|sumo deadlift|romanian deadlift|stiff leg deadlift|rack pull|overhead press|seated overhead press|push press|bent over row|pendlay row|hip thrust|good morning)\b/i;
/** Isolation movements get 10–15. */
const ISOLATION = /(curl|raise|fly|crossover|extension|pushdown|kickback|face pull|pullover|shrug|abductor|adductor|reverse fly|upright row|crunch|woodchopper|pallof|wrist)/i;

/**
 * Rule-based default rep range:
 * big barbell compounds 5–8, isolation / cable / lateral raises 10–15, other
 * weighted exercises 8–12; reps-only, duration and distance exercises none.
 */
export function defaultRepRange(e: Pick<Exercise, 'name' | 'equipment' | 'trackingType' | 'bodyPart'>): RepRange | null {
  if (!usesWeight(e.trackingType)) return null;
  if (e.bodyPart === 'Olympic' || e.bodyPart === 'Cardio') return null;
  const movement = e.name.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (e.equipment === 'Barbell' && e.trackingType === 'weight_reps' && BIG_COMPOUND.test(movement)) return { min: 5, max: 8 };
  if (e.equipment === 'Cable' || ISOLATION.test(movement)) return { min: 10, max: 15 };
  return { min: 8, max: 12 };
}

/** The exercise's own rep range (its override, else the rule-based default). */
export function exerciseRepRange(e: Exercise | undefined): RepRange | null {
  if (!e) return null;
  if (e.repRange !== undefined) return e.repRange;
  return defaultRepRange(e);
}

/** Rep range used in a workout: template override → exercise → none. */
export function effectiveRepRange(e: Exercise | undefined, template: Template | undefined): RepRange | null {
  const te = e && template?.exercises.find((x) => x.exerciseId === e.id);
  if (te?.repRange) return te.repRange;
  return exerciseRepRange(e);
}

export function formatRepRange(r: RepRange | null | undefined): string {
  return r ? `${r.min}–${r.max}` : 'none';
}

export type Suggestion =
  | { kind: 'increase'; weightKg: number; reps: number }
  | { kind: 'hold'; weightKg: number; targetReps: number }
  | { kind: 'decrease'; weightKg: number };

/** Sets that drive progression: completed normal and failure sets with weight and reps. */
export function progressionSets(sets: WorkoutSet[]): WorkoutSet[] {
  return sets.filter((s) => s.completed && (s.type === 'normal' || s.type === 'failure') && s.reps !== undefined);
}

const sameWeight = (sets: WorkoutSet[]) => sets.length > 0 && sets.every((s) => Math.abs((s.weight ?? 0) - (sets[0].weight ?? 0)) < 1e-6);

/**
 * Decide next session's target from the previous sessions (newest first; each
 * is that session's completed sets). `stepKg` is the effective weight step.
 * For assisted exercises the weight is assistance, so "heavier" means less.
 */
export function suggestProgression(opts: {
  sessions: WorkoutSet[][];
  range: RepRange | null;
  stepKg: number;
  tracking: TrackingType;
}): Suggestion | null {
  const { range, stepKg, tracking } = opts;
  if (!range || !usesWeight(tracking)) return null;
  const last = progressionSets(opts.sessions[0] ?? []);
  if (!last.length) return null;
  const assisted = tracking === 'assisted_bodyweight';
  const w0 = last[0].weight ?? 0;

  if (sameWeight(last) && last.every((s) => (s.reps ?? 0) >= range.max)) {
    // Assisted at zero assistance can't get any harder here.
    if (!assisted || w0 > 0) {
      const next = assisted ? Math.max(0, w0 - stepKg) : w0 + stepKg;
      return { kind: 'increase', weightKg: Math.round(next * 1000) / 1000, reps: range.min };
    }
  }

  const prev = progressionSets(opts.sessions[1] ?? []);
  const allBelow = (sets: WorkoutSet[]) => sets.every((s) => (s.reps ?? 0) < range.min);
  if (sameWeight(last) && sameWeight(prev) && Math.abs((prev[0].weight ?? 0) - w0) < 1e-6 && allBelow(last) && allBelow(prev)) {
    const lighter = roundToStep(assisted ? w0 + stepKg : w0 - stepKg, stepKg);
    if (lighter >= 0 && lighter !== w0) return { kind: 'decrease', weightKg: lighter };
  }

  const inRange = last.filter((s) => (s.reps ?? 0) >= range.min && (s.reps ?? 0) <= range.max);
  if (inRange.length) {
    // The working weight: heaviest set in range (least assistance for assisted).
    const top = inRange.reduce((a, b) => ((assisted ? (b.weight ?? 0) < (a.weight ?? 0) : (b.weight ?? 0) > (a.weight ?? 0)) ? b : a));
    // Aim to lift the weakest set at that weight by a rep (every set must reach the top).
    const weakest = Math.min(...last.filter((s) => s.weight === top.weight).map((s) => s.reps ?? 0));
    return { kind: 'hold', weightKg: top.weight ?? 0, targetReps: Math.min(range.max, weakest + 1) };
  }
  return null;
}
