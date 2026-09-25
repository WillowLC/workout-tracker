import type { Equipment, Exercise, Settings, WeightSteps } from './types';
import { DEFAULT_WEIGHT_STEPS_KG, DEFAULT_SETTINGS, EQUIPMENT, MUSCLES } from './types';
import { lbToKg } from './units';

/** Default ± steps in pounds (stored as kg). */
export const DEFAULT_WEIGHT_STEPS_LB: Record<Equipment, number> = {
  Dumbbell: 5,
  Barbell: 5,
  'Smith Machine': 5,
  Machine: 10,
  Cable: 10,
  Kettlebell: 9,
  Band: 5,
  Bodyweight: 5,
  Assisted: 5,
  Other: 5,
};

export function defaultWeightSteps(unit: Settings['unit']): WeightSteps {
  if (unit === 'kg') return { ...DEFAULT_WEIGHT_STEPS_KG };
  return Object.fromEntries(EQUIPMENT.map((e) => [e, lbToKg(DEFAULT_WEIGHT_STEPS_LB[e])])) as WeightSteps;
}

/** The step the ± stepper, progression hints and rounding use for an exercise (kg). */
export function effectiveStepKg(exercise: Pick<Exercise, 'equipment' | 'weightStepKg'> | undefined, settings: Pick<Settings, 'weightStepsKg'>): number {
  if (exercise?.weightStepKg && exercise.weightStepKg > 0) return exercise.weightStepKg;
  const eq = exercise?.equipment ?? 'Other';
  return settings.weightStepsKg[eq] ?? DEFAULT_WEIGHT_STEPS_KG[eq] ?? 2.5;
}

/** Round to the nearest multiple of `step` (tolerant of float noise). */
export function roundToStep(kg: number, step: number): number {
  if (!(step > 0)) return kg;
  return Math.round(Math.round(kg / step) * step * 1000) / 1000;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isRange = (v: unknown): v is { min: number; max: number } => isObj(v) && typeof v.min === 'number' && typeof v.max === 'number';

/**
 * Bring stored settings (any app version, or a backup) up to the current shape.
 * The old single `weightIncrementKg` becomes the Barbell and Smith Machine step
 * when it had been changed from its unit's default (2.5 kg or 5 lb).
 */
export function migrateSettings(raw: unknown): Settings {
  const r = isObj(raw) ? raw : {};
  const unit: Settings['unit'] = r.unit === 'lb' ? 'lb' : 'kg';
  const { weightIncrementKg, ...rest } = r as Record<string, unknown> & { weightIncrementKg?: unknown };
  const out = { ...DEFAULT_SETTINGS, ...rest, unit } as Settings;
  if (!isObj(r.weightStepsKg)) {
    const steps = defaultWeightSteps(unit);
    const unitDefault = unit === 'lb' ? lbToKg(5) : 2.5;
    if (typeof weightIncrementKg === 'number' && weightIncrementKg > 0 && Math.abs(weightIncrementKg - unitDefault) > 1e-6) {
      steps.Barbell = weightIncrementKg;
      steps['Smith Machine'] = weightIncrementKg;
    }
    out.weightStepsKg = steps;
  } else {
    out.weightStepsKg = { ...defaultWeightSteps(unit), ...(r.weightStepsKg as Partial<WeightSteps>) };
  }
  if (!isRange(out.weeklySetTarget)) out.weeklySetTarget = { ...DEFAULT_SETTINGS.weeklySetTarget };
  if (out.muscleTargets) {
    out.muscleTargets = Object.fromEntries(Object.entries(out.muscleTargets).filter(([m, v]) => (MUSCLES as readonly string[]).includes(m) && isRange(v)));
  }
  return out;
}
