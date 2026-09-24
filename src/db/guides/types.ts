/** Original how-to text for a built-in exercise (written for Jim). */
export interface ExerciseGuide {
  /** How to perform it, in order. */
  steps: string[];
  /** Form cues, including mental images ("imagine…"). */
  cues: string[];
  /** Common mistakes to avoid. */
  mistakes: string[];
}

export type GuideMap = Record<string, ExerciseGuide>;

export const g = (steps: string[], cues: string[], mistakes: string[]): ExerciseGuide => ({ steps, cues, mistakes });

/** A variant of another guide: replace some steps, add extra cues/mistakes. */
export function variant(
  base: ExerciseGuide,
  opts: { steps?: string[]; setup?: string; cues?: string[]; mistakes?: string[] },
): ExerciseGuide {
  const steps = opts.steps ?? (opts.setup ? [opts.setup, ...base.steps.slice(1)] : base.steps);
  return { steps, cues: [...(opts.cues ?? []), ...base.cues], mistakes: [...base.mistakes, ...(opts.mistakes ?? [])] };
}
