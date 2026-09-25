export type TrackingType =
  | 'weight_reps'
  | 'weighted_bodyweight'
  | 'assisted_bodyweight'
  | 'reps_only'
  | 'duration'
  | 'distance_duration';

export const BODY_PARTS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Olympic', 'Full Body', 'Cardio', 'Other'] as const;
export type BodyPart = (typeof BODY_PARTS)[number];

export const EQUIPMENT = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Kettlebell', 'Smith Machine', 'Band', 'Bodyweight', 'Assisted', 'Other'] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const TRACKING_TYPES: { value: TrackingType; label: string }[] = [
  { value: 'weight_reps', label: 'Weight & reps' },
  { value: 'weighted_bodyweight', label: 'Weighted bodyweight (+kg & reps)' },
  { value: 'assisted_bodyweight', label: 'Assisted bodyweight (−kg & reps)' },
  { value: 'reps_only', label: 'Reps only' },
  { value: 'duration', label: 'Duration' },
  { value: 'distance_duration', label: 'Distance & duration' },
];

export const MUSCLES = [
  'chest', 'front_delts', 'side_delts', 'rear_delts', 'lats', 'upper_back', 'traps', 'lower_back', 'biceps', 'triceps',
  'forearms', 'abs', 'obliques', 'quads', 'hamstrings', 'glutes', 'adductors', 'abductors', 'calves',
] as const;
export type Muscle = (typeof MUSCLES)[number];

/** Inclusive target rep range for double progression. */
export interface RepRange {
  min: number;
  max: number;
}

export interface Exercise {
  id: string;
  name: string;
  bodyPart: BodyPart;
  equipment: Equipment;
  trackingType: TrackingType;
  isCustom: boolean;
  notes?: string;
  archived?: boolean;
  /** Muscles trained. Undefined = never tagged (custom exercises made before tagging existed). */
  primaryMuscles?: Muscle[];
  secondaryMuscles?: Muscle[];
  /** Default rep range. Undefined = use the rule-based default; null = explicitly none. */
  repRange?: RepRange | null;
  /** Overrides the equipment's weight step (kg). */
  weightStepKg?: number;
}

export interface Gym {
  id: string;
  name: string;
  /** Created by "Load demo data"; removed by "Clear demo data". */
  demo?: boolean;
}

export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

export interface WorkoutSet {
  id: string;
  type: SetType;
  weight?: number; // kg
  reps?: number;
  durationSec?: number;
  distanceM?: number;
  rpe?: number;
  completed: boolean;
  completedAt?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  order: number;
  supersetGroupId?: string;
  sets: WorkoutSet[];
  sessionNote?: string;
}

export interface Workout {
  id: string;
  name: string;
  startedAt: number;
  finishedAt?: number;
  exercises: WorkoutExercise[];
  note?: string;
  templateId?: string;
  /** Gym the workout was done at. Undefined = no gym ("anywhere"). */
  gymId?: string;
  /** Silly volume comparison picked when the workout was finished (see data/volumeComparisons.ts). */
  volumeComparisonId?: string;
  /** Created by "Load demo data"; removed by "Clear demo data". */
  demo?: boolean;
}

export interface TemplateSet {
  type: SetType;
  targetReps?: number;
}

export interface TemplateExercise {
  exerciseId: string;
  order: number;
  supersetGroupId?: string;
  sets: TemplateSet[];
  /** Overrides the exercise's rep range for this template. */
  repRange?: RepRange;
}

export interface Template {
  id: string;
  name: string;
  folder?: string;
  /** Position on the Workout screen within its folder (lower first). Unset sorts last, by name. */
  order?: number;
  exercises: TemplateExercise[];
}

/** Monday-first week: each day is a template ID or null for a rest day. */
export type WeekPlan = (string | null)[];

/** Per-folder settings. Folders themselves are implicit (Template.folder); this only adds order and a weekly split. */
export interface FolderInfo {
  name: string;
  order?: number;
  plan?: WeekPlan;
}

export type WeightSteps = Record<Equipment, number>;

export interface Settings {
  unit: 'kg' | 'lb';
  countWarmupsInStats: boolean;
  showRpe: boolean;
  /** ± step per equipment, in kg (see domain/weightSteps.ts). */
  weightStepsKg: WeightSteps;
  barWeightKg: number;
  /** Weekly working-set target per muscle. */
  weeklySetTarget: RepRange;
  muscleTargets?: Partial<Record<Muscle, RepRange>>;
  progressionHints: boolean;
  celebrations: boolean;
  /** Gym new workouts are tagged with. */
  currentGymId?: string;
}

export const DEFAULT_WEIGHT_STEPS_KG: WeightSteps = {
  Dumbbell: 2,
  Barbell: 2.5,
  'Smith Machine': 2.5,
  Machine: 5,
  Cable: 5,
  Kettlebell: 4,
  Band: 2.5,
  Bodyweight: 2.5,
  Assisted: 2.5,
  Other: 2.5,
};

export const DEFAULT_SETTINGS: Settings = {
  unit: 'kg',
  countWarmupsInStats: false,
  showRpe: false,
  weightStepsKg: DEFAULT_WEIGHT_STEPS_KG,
  barWeightKg: 20,
  weeklySetTarget: { min: 10, max: 20 },
  progressionHints: true,
  celebrations: true,
};

export type PRKind = 'weight' | 'e1rm' | 'volume';

/**
 * One personal record broken in a workout: the best value reached for that
 * exercise and kind in that workout, and the record it beat. Derived from
 * history (rebuilt whenever past workouts change) and stored for fast lookup.
 */
export interface PersonalRecord {
  id: string;
  exerciseId: string;
  workoutId: string;
  /** The set that reached `value`. */
  setId: string;
  kind: PRKind;
  /** weight: the set's main metric (see prMetric); e1rm: kg; volume: session volume. */
  value: number;
  /** Undefined = first ever. */
  previous?: number;
  /** Snapshot of the record set, and of the set it beat (best-set PRs). */
  set: SetValues;
  previousSet?: SetValues;
  /** Workout start time. */
  date: number;
}

/** The numeric fields of a set that the user can enter. */
export type SetValues = Pick<WorkoutSet, 'weight' | 'reps' | 'durationSec' | 'distanceM' | 'rpe'>;
