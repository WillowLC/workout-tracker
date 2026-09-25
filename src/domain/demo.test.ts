// The demo data must show every progress feature (definition of done).
import { describe, expect, it } from 'vitest';
import { DEMO_GYM_MAIN, DEMO_GYM_TRAVEL, generateDemoData } from './demo';
import { previousSessions } from './previous';
import { exerciseRepRange, suggestProgression } from './progression';
import { effectiveStepKg } from './weightSteps';
import { detectPlateaus, recentExerciseIds } from './plateau';
import { muscleSets, weekPeriod } from './muscles';
import { buildPRHistory } from './prs';
import { availableRecaps } from './recap';
import { SEED_BY_ID } from '../db/seed';
import { DEFAULT_SETTINGS } from './types';

const now = new Date(2026, 8, 25, 20).getTime();
let n = 0;
const { workouts, gyms } = generateDemoData(now, () => `id${++n}`);
const trackingOf = (id: string) => SEED_BY_ID.get(id)?.trackingType;

const hint = (exerciseId: string, gymId = DEMO_GYM_MAIN) => {
  const ex = SEED_BY_ID.get(exerciseId)!;
  return suggestProgression({
    sessions: previousSessions(exerciseId, workouts, { gymId }).slice(0, 2).map((s) => s.sets),
    range: exerciseRepRange(ex),
    stepKg: effectiveStepKg(ex, DEFAULT_SETTINGS),
    tracking: ex.trackingType,
  });
};

describe('demo data', () => {
  it('is tagged, uses only built-in exercises, and ends before now', () => {
    expect(workouts.length).toBeGreaterThan(150);
    expect(workouts.every((w) => w.demo && w.finishedAt! < now)).toBe(true);
    expect(gyms.every((g) => g.demo)).toBe(true);
    expect(workouts.every((w) => w.exercises.every((we) => SEED_BY_ID.has(we.exerciseId)))).toBe(true);
  });
  it('bench press hit the top of the range → increase hint', () => {
    expect(hint('seed-bench-press-barbell')).toEqual({ kind: 'increase', weightKg: 82.5, reps: 5 });
  });
  it('lateral raises stalled below the range twice → consider lighter', () => {
    expect(hint('seed-lateral-raise-dumbbell')).toEqual({ kind: 'decrease', weightKg: 10 });
  });
  it('overhead press is the one plateaued exercise', () => {
    const p = detectPlateaus(recentExerciseIds(workouts, now), trackingOf, workouts, false, now);
    expect(p.map((x) => x.exerciseId)).toEqual(['seed-overhead-press-barbell']);
  });
  it('leg press PREVIOUS differs by gym', () => {
    const main = previousSessions('seed-leg-press', workouts, { gymId: DEMO_GYM_MAIN })[0];
    const travel = previousSessions('seed-leg-press', workouts, { gymId: DEMO_GYM_TRAVEL })[0];
    expect(main.sets[main.sets.length - 1].weight).toBeGreaterThan(travel.sets[travel.sets.length - 1].weight! + 50);
  });
  it('this week has sets per muscle, and there are PRs and recaps', () => {
    const exMap = new Map([...SEED_BY_ID]);
    const wk = muscleSets(workouts, exMap, false, weekPeriod(now));
    expect(wk.chest.total + wk.quads.total + wk.lats.total).toBeGreaterThan(5);
    expect(buildPRHistory(workouts, trackingOf, false).length).toBeGreaterThan(50);
    expect(availableRecaps(workouts).years.length).toBe(2);
    expect(workouts.every((w) => w.volumeComparisonId)).toBe(true);
  });
});
