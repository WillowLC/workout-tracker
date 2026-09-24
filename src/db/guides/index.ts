import type { ExerciseGuide } from './types';
import { chestGuides } from './chest';
import { backGuides } from './back';
import { legGuides } from './legs';
import { shoulderGuides } from './shoulders';
import { armGuides } from './arms';
import { coreGuides } from './core';
import { otherGuides } from './other';

export type { ExerciseGuide } from './types';

export const EXERCISE_GUIDES: Record<string, ExerciseGuide> = {
  ...chestGuides,
  ...backGuides,
  ...legGuides,
  ...shoulderGuides,
  ...armGuides,
  ...coreGuides,
  ...otherGuides,
};
