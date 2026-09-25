// Gym-aware PREVIOUS, plateau detection and the PR history table.
import { describe, expect, it } from 'vitest';
import { findPreviousPerformance, previousSessions } from './previous';
import { detectPlateau, detectPlateaus } from './plateau';
import { buildPRHistory, workoutPRRecords } from './prs';
import { set, we, workout } from '../test/fixtures';
import type { TrackingType } from './types';

const DAY = 86_400_000;
const t = (): TrackingType => 'weight_reps';

describe('PREVIOUS with gyms', () => {
  const home = workout(1000, [we('bench', [set(100, 5)])], { gymId: 'home' });
  const hotel = workout(2000, [we('bench', [set(60, 10)])], { gymId: 'hotel' });
  const none = workout(3000, [we('bench', [set(90, 5)])]);

  it('uses the most recent session at the current gym', () => {
    const p = findPreviousPerformance('bench', [home, hotel, none], { gymId: 'home' });
    expect(p?.workoutId).toBe(home.id);
    expect(p?.otherGym).toBeFalsy();
    expect(findPreviousPerformance('bench', [home, hotel, none], { gymId: 'hotel' })?.workoutId).toBe(hotel.id);
  });
  it('falls back to the most recent anywhere (gym-less workouts count as anywhere)', () => {
    const p = findPreviousPerformance('bench', [home, hotel, none], { gymId: 'new-gym' });
    expect(p?.workoutId).toBe(none.id);
    expect(p?.otherGym).toBeFalsy(); // gym unknown → not flagged
    const q = findPreviousPerformance('bench', [home, hotel], { gymId: 'new-gym' });
    expect(q?.workoutId).toBe(hotel.id);
    expect(q?.otherGym).toBe(true);
  });
  it('without a current gym, the most recent anywhere', () => {
    expect(findPreviousPerformance('bench', [home, hotel, none])?.workoutId).toBe(none.id);
  });
  it('previousSessions lists the preferred pool newest first', () => {
    const home2 = workout(4000, [we('bench', [set(102.5, 5)])], { gymId: 'home' });
    expect(previousSessions('bench', [home, hotel, none, home2], { gymId: 'home' }).map((s) => s.workoutId)).toEqual([home2.id, home.id]);
  });
});

describe('plateau detection', () => {
  const now = new Date(2026, 8, 25, 12).getTime();
  const at = (daysAgo: number, weight: number, reps: number) => workout(now - daysAgo * DAY, [we('ohp', [set(weight, reps), set(weight, reps)])]);

  it('4+ sessions in 6 weeks, no new best set or e1RM, last within 14 days → plateau', () => {
    const hist = [at(60, 52.5, 5), at(40, 50, 5), at(30, 50, 5), at(20, 50, 5), at(5, 50, 5)];
    const p = detectPlateau('ohp', 'weight_reps', hist, false, now);
    expect(p).toMatchObject({ exerciseId: 'ohp', sessions: 4, weeks: 8 });
  });
  it('a new best set in the window clears it', () => {
    const hist = [at(60, 52.5, 5), at(40, 50, 5), at(30, 55, 3), at(20, 50, 5), at(5, 50, 5)];
    expect(detectPlateau('ohp', 'weight_reps', hist, false, now)).toBeNull();
  });
  it('a new best e1RM (lighter, more reps) clears it too', () => {
    const hist = [at(60, 52.5, 5), at(40, 50, 5), at(30, 50, 10), at(20, 50, 5), at(5, 50, 5)];
    expect(detectPlateau('ohp', 'weight_reps', hist, false, now)).toBeNull();
  });
  it('fewer than 4 sessions in the window → no plateau', () => {
    expect(detectPlateau('ohp', 'weight_reps', [at(60, 52.5, 5), at(30, 50, 5), at(20, 50, 5), at(5, 50, 5)], false, now)).toBeNull();
  });
  it('not done in the last 14 days → no nagging', () => {
    const hist = [at(60, 52.5, 5), at(40, 50, 5), at(35, 50, 5), at(25, 50, 5), at(15, 50, 5)];
    expect(detectPlateau('ohp', 'weight_reps', hist, false, now)).toBeNull();
  });
  it('no history before the window: the first session is the baseline', () => {
    expect(detectPlateau('ohp', 'weight_reps', [at(40, 50, 5), at(30, 50, 5), at(20, 50, 5), at(5, 50, 5)], false, now)).not.toBeNull();
    expect(detectPlateau('ohp', 'weight_reps', [at(40, 50, 5), at(30, 50, 6), at(20, 50, 5), at(5, 50, 5)], false, now)).toBeNull();
  });
  it('snoozed exercises are skipped until the snooze ends', () => {
    const hist = [at(60, 52.5, 5), at(40, 50, 5), at(30, 50, 5), at(20, 50, 5), at(5, 50, 5)];
    expect(detectPlateaus(['ohp'], t, hist, false, now, { ohp: now + DAY })).toEqual([]);
    expect(detectPlateaus(['ohp'], t, hist, false, now, { ohp: now - 1 })).toHaveLength(1);
  });
});

describe('PR history table', () => {
  it('one row per exercise and kind per workout, with the value it beat', () => {
    const w1 = workout(1000, [we('bench', [set(100, 5), set(90, 8)])]);
    const w2 = workout(2000, [we('bench', [set(102.5, 3), set(105, 3), set(95, 10)])]);
    const rows = buildPRHistory([w2, w1], t, false);
    const w1Rows = rows.filter((r) => r.workoutId === w1.id);
    // First ever: only a best-set PR (100×5 — 90×8 doesn't beat it). No "previous".
    expect(w1Rows).toHaveLength(1);
    expect(w1Rows[0]).toMatchObject({ kind: 'weight', value: 100, previous: undefined, set: { weight: 100, reps: 5 } });
    const best = rows.find((r) => r.workoutId === w2.id && r.kind === 'weight')!;
    // Two best-set PRs in the workout collapse to one: 105×3, which beat 100×5.
    expect(best).toMatchObject({ value: 105, previous: 100, set: { weight: 105, reps: 3 }, previousSet: { weight: 100, reps: 5 }, date: 2000 });
    const e1 = rows.find((r) => r.workoutId === w2.id && r.kind === 'e1rm')!;
    expect(e1.previous).toBeCloseTo(116.67, 1); // 100×5
    expect(e1.value).toBeCloseTo(126.67, 1); // 95×10
    const vol = rows.find((r) => r.workoutId === w2.id && r.kind === 'volume')!;
    expect(vol).toMatchObject({ previous: 1220, value: 1572.5 });
    expect(rows).toHaveLength(4);
  });
  it('matches per-workout detection, whatever the order', () => {
    const ws = [
      workout(1000, [we('bench', [set(100, 5)]), we('squat', [set(120, 5)])]),
      workout(2000, [we('bench', [set(95, 10)])]),
      workout(3000, [we('squat', [set(125, 5), set(125, 5)]), we('bench', [set(100, 6)])]),
      workout(4000, [we('bench', [set(90, 5)])]),
    ];
    const all = buildPRHistory([...ws].reverse(), t, false);
    const each = ws.flatMap((w) => workoutPRRecords(w, ws, t, false));
    const key = (r: { id: string; value: number; previous?: number }) => `${r.id}=${r.value.toFixed(3)}/${r.previous?.toFixed(3)}`;
    expect(all.map(key).sort()).toEqual(each.map(key).sort());
    expect(all.filter((r) => r.workoutId === ws[3].id)).toEqual([]);
  });
});
