// "Load demo data": ~14 months of push/pull/legs history across two gyms,
// shaped so every progress feature has something to show. Everything is
// tagged `demo: true` so "Clear demo data" never touches real workouts.
import type { Gym, SetType, Workout, WorkoutExercise, WorkoutSet } from './types';
import { DAY_MS } from './muscles';
import { pickComparison, seededRng } from './volumeComparison';
import { workoutVolume } from './records';

export const DEMO_GYM_MAIN = 'demo-gym-main';
export const DEMO_GYM_TRAVEL = 'demo-gym-travel';

export const DEMO_GYMS: Gym[] = [
  { id: DEMO_GYM_MAIN, name: 'Demo Gym Downtown', demo: true },
  { id: DEMO_GYM_TRAVEL, name: 'Demo Hotel Gym', demo: true },
];

interface Plan {
  id: string;
  sets: number;
  /** Working weight at the latest session (history climbs to it). */
  end: number;
  step: number;
  /** Sessions per weight increase; reps climb from min to max within each block. */
  every: number;
  reps: [number, number];
  warmup?: number;
  tracking?: 'duration';
}

const s = (id: string, sets: number, end: number, step: number, every: number, reps: [number, number], warmup?: number): Plan => ({ id, sets, end, step, every, reps, warmup });

const DAYS: { name: string; plans: Plan[] }[] = [
  {
    name: 'Push Day',
    plans: [
      s('seed-bench-press-barbell', 3, 80, 2.5, 3, [5, 8], 40),
      s('seed-overhead-press-barbell', 3, 50, 2.5, 3, [5, 8]),
      s('seed-incline-bench-press-dumbbell', 3, 28, 2, 4, [8, 12]),
      s('seed-lateral-raise-dumbbell', 3, 10, 2, 8, [10, 15]),
      s('seed-triceps-rope-pushdown-cable', 3, 35, 5, 5, [10, 15]),
    ],
  },
  {
    name: 'Pull Day',
    plans: [
      s('seed-deadlift-barbell', 2, 140, 2.5, 3, [5, 8], 60),
      s('seed-lat-pulldown-cable', 3, 65, 5, 4, [10, 15]),
      s('seed-seated-row-cable', 3, 60, 5, 4, [10, 15]),
      s('seed-face-pull-cable', 3, 25, 5, 6, [10, 15]),
      s('seed-bicep-curl-dumbbell', 3, 14, 2, 5, [8, 12]),
    ],
  },
  {
    name: 'Leg Day',
    plans: [
      s('seed-squat-barbell', 3, 100, 2.5, 3, [5, 8], 50),
      s('seed-leg-press', 3, 200, 10, 3, [8, 12]),
      s('seed-romanian-deadlift-barbell', 3, 90, 2.5, 3, [5, 8]),
      s('seed-lying-leg-curl-machine', 3, 45, 5, 5, [10, 15]),
      s('seed-standing-calf-raise-machine', 3, 70, 5, 5, [10, 15]),
      { id: 'seed-plank', sets: 2, end: 90, step: 5, every: 2, reps: [0, 0], tracking: 'duration' },
    ],
  },
];

const round = (x: number, step: number) => Math.round(x / step) * step;

/**
 * Deterministic demo history ending just before `now`. Scenarios:
 * - Bench Press: the last session at the main gym hit the top of 5–8 on every set → "↑ Try +2.5 kg".
 * - Overhead Press: stuck for 6+ weeks after a 52.5 kg best → plateau alert.
 * - Lateral Raise: the last two main-gym sessions were below 10 reps → "↓ Consider lighter".
 * - Leg Press: much lighter at the hotel gym → switching gyms changes PREVIOUS.
 */
export function generateDemoData(now: number, newId: () => string): { gyms: Gym[]; workouts: Workout[] } {
  const rng = seededRng('jim-demo');
  const start = new Date(now - 420 * DAY_MS);
  start.setHours(0, 0, 0, 0);
  const sessionsOf = new Map<string, number>();
  const workouts: Workout[] = [];
  let dayIdx = 0;

  const slots: { at: number; day: number; gymId: string }[] = [];
  for (let d = new Date(start); d.getTime() < now; d.setDate(d.getDate() + 1)) {
    const wd = (d.getDay() + 6) % 7; // 0 = Monday
    if (wd !== 0 && wd !== 2 && wd !== 4) continue;
    const at = new Date(d);
    // Mostly evenings, some morning Fridays.
    if (wd === 4 && slots.length % 4 === 1) at.setHours(7, 30 + Math.floor(rng() * 20));
    else at.setHours(17 + Math.floor(rng() * 2), Math.floor(rng() * 50));
    if (at.getTime() + 80 * 60_000 > now) continue;
    slots.push({ at: at.getTime(), day: dayIdx % 3, gymId: slots.length % 5 === 3 ? DEMO_GYM_TRAVEL : DEMO_GYM_MAIN });
    dayIdx++;
  }
  // The last session of each exercise at the main gym (for scripted endings).
  const lastMain = new Map<number, number>();
  const secondLastMain = new Map<number, number>();
  slots.forEach((sl, i) => {
    if (sl.gymId !== DEMO_GYM_MAIN) return;
    if (lastMain.has(sl.day)) secondLastMain.set(sl.day, lastMain.get(sl.day)!);
    lastMain.set(sl.day, i);
  });

  const totals = new Map<number, number>();
  for (const sl of slots) totals.set(sl.day, (totals.get(sl.day) ?? 0) + 1);

  const recent: string[] = [];
  slots.forEach((slot, i) => {
    const day = DAYS[slot.day];
    const daysAgo = (now - slot.at) / DAY_MS;
    const travel = slot.gymId === DEMO_GYM_TRAVEL;
    let clock = slot.at + 5 * 60_000;
    const exercises: WorkoutExercise[] = day.plans.map((p, order) => {
      const k = sessionsOf.get(p.id) ?? 0;
      sessionsOf.set(p.id, k + 1);
      const total = totals.get(slot.day)!;
      const block = Math.floor(k / p.every);
      const pos = k % p.every;
      const base = p.end - p.step * Math.floor((total - 1) / p.every);
      let weight = Math.max(p.step, base + p.step * block);
      const [lo, hi] = p.reps;
      let reps = Array.from({ length: p.sets }, (_, j) => Math.max(lo, Math.round(lo + ((hi - lo) * pos) / Math.max(1, p.every - 1)) - (j === p.sets - 1 && pos > 0 ? 1 : 0)));
      let weights = reps.map(() => weight);

      if (p.id === 'seed-bench-press-barbell') {
        if (i === lastMain.get(slot.day)) { weights = [80, 80, 80]; reps = [8, 8, 8]; }
        else if (i === secondLastMain.get(slot.day)) { weights = [80, 80, 80]; reps = [8, 7, 6]; }
      }
      if (p.id === 'seed-overhead-press-barbell') {
        if (daysAgo <= 42) { weights = [50, 50, 50]; reps = [6, 6, 5]; }
        else if (daysAgo <= 56) { weights = [52.5, 52.5, 52.5]; reps = [5, 4, 4]; }
        else if (daysAgo <= 84) { weights = [50, 50, 50]; reps = [7, 6, 6]; }
        else { weights = weights.map((w) => Math.min(w, 47.5)); }
      }
      if (p.id === 'seed-lateral-raise-dumbbell') {
        if (i === lastMain.get(slot.day) || i === secondLastMain.get(slot.day)) { weights = [12, 12, 12]; reps = [8, 8, 7]; }
      }
      if (travel) {
        // Different kit at the hotel: machines and cables are much lighter.
        const f = p.id === 'seed-leg-press' ? 0.55 : 0.85;
        weights = weights.map((w) => round(w * f, p.step));
      }

      const sets: WorkoutSet[] = [];
      const add = (type: SetType, values: Partial<WorkoutSet>) => {
        clock += 90_000 + Math.floor(rng() * 90_000);
        sets.push({ id: newId(), type, completed: true, completedAt: clock, ...values });
      };
      if (p.tracking === 'duration') {
        for (let j = 0; j < p.sets; j++) add('normal', { durationSec: Math.max(20, p.end - p.step * Math.floor((totals.get(slot.day)! - 1 - k) / p.every)) });
      } else {
        if (p.warmup) add('warmup', { weight: p.warmup, reps: 8 });
        weights.forEach((w, j) => add('normal', { weight: w, reps: reps[j] }));
      }
      return { id: newId(), exerciseId: p.id, order, sets };
    });
    const w: Workout = {
      id: newId(),
      name: day.name,
      startedAt: slot.at,
      finishedAt: clock + 3 * 60_000,
      exercises,
      gymId: slot.gymId,
      demo: true,
    };
    const vol = workoutVolume(w, (id) => (id === 'seed-plank' ? 'duration' : 'weight_reps'), false);
    const pick = pickComparison(vol, recent, rng);
    if (pick) {
      w.volumeComparisonId = pick.item.id;
      recent.push(pick.item.id);
      if (recent.length > 5) recent.shift();
    }
    workouts.push(w);
  });
  return { gyms: DEMO_GYMS.map((g) => ({ ...g })), workouts };
}
