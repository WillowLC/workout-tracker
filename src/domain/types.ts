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

export interface Exercise {
  id: string;
  name: string;
  bodyPart: BodyPart;
  equipment: Equipment;
  trackingType: TrackingType;
  isCustom: boolean;
  notes?: string;
  defaultRestSeconds?: number;
  archived?: boolean;
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
  restSeconds?: number;
}

export interface Workout {
  id: string;
  name: string;
  startedAt: number;
  finishedAt?: number;
  exercises: WorkoutExercise[];
  note?: string;
  templateId?: string;
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
}

export interface Template {
  id: string;
  name: string;
  folder?: string;
  exercises: TemplateExercise[];
}

export interface Settings {
  unit: 'kg' | 'lb';
  defaultRestSeconds: number;
  autoStartRestTimer: boolean;
  countWarmupsInStats: boolean;
  showRpe: boolean;
  weightIncrementKg: number;
  barWeightKg: number;
}

export const DEFAULT_SETTINGS: Settings = {
  unit: 'kg',
  defaultRestSeconds: 120,
  autoStartRestTimer: true,
  countWarmupsInStats: false,
  showRpe: false,
  weightIncrementKg: 2.5,
  barWeightKg: 20,
};

/** The numeric fields of a set that the user can enter. */
export type SetValues = Pick<WorkoutSet, 'weight' | 'reps' | 'durationSec' | 'distanceM' | 'rpe'>;
