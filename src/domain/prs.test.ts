import { describe, expect, it } from 'vitest';
import { detectPRs } from './prs';
import { set, we, workout } from '../test/fixtures';
import type { TrackingType } from './types';

const t = (): TrackingType => 'weight_reps';

describe('detectPRs', () => {
  const history = [workout(1000, [we('bench', [set(100, 5), set(90, 8)])])]; // best set 100×5, vol 1220, e1RM 120 (90×8)

  it('heavier set → best-set PR', () => {
    const cur = workout(5000, [we('bench', [set(102.5, 3)])], { finishedAt: undefined });
    const prs = detectPRs(cur, history, t, false);
    expect(prs.get(cur.exercises[0].sets[0].id)?.kinds).toContain('weight');
  });
  it('same weight, more reps → best-set PR (rep tiebreak)', () => {
    const cur = workout(5000, [we('bench', [set(100, 6)])], { finishedAt: undefined });
    expect(detectPRs(cur, history, t, false).get(cur.exercises[0].sets[0].id)?.kinds).toContain('weight');
  });
  it('lighter set with higher e1RM → e1RM PR only', () => {
    const cur = workout(5000, [we('bench', [set(95, 10)])], { finishedAt: undefined }); // e1RM 126.7
    expect(detectPRs(cur, history, t, false).get(cur.exercises[0].sets[0].id)?.kinds).toEqual(['e1rm']);
  });
  it('session volume PR is awarded once, on the set that crosses the record', () => {
    const cur = workout(5000, [we('bench', [set(80, 8), set(80, 8)])], { finishedAt: undefined }); // 640, 1280 > 1220
    const prs = detectPRs(cur, history, t, false);
    expect(prs.get(cur.exercises[0].sets[0].id)).toBeUndefined();
    expect(prs.get(cur.exercises[0].sets[1].id)?.kinds).toEqual(['volume']);
  });
  it('a later set must beat earlier sets in the same session', () => {
    const cur = workout(5000, [we('bench', [set(105, 3), set(102.5, 3)])], { finishedAt: undefined });
    const prs = detectPRs(cur, history, t, false);
    expect(prs.get(cur.exercises[0].sets[0].id)?.kinds).toContain('weight');
    expect(prs.get(cur.exercises[0].sets[1].id)?.kinds ?? []).not.toContain('weight');
  });
  it('warm-ups never award PRs by default; first-ever session awards none', () => {
    const cur = workout(5000, [we('bench', [set(150, 1, 'warmup')]), we('squat', [set(200, 5)])], { finishedAt: undefined });
    expect(detectPRs(cur, history, t, false).size).toBe(0);
  });
  it('ignores workouts that started after this one (editing history)', () => {
    const later = workout(9000, [we('bench', [set(200, 5)])]);
    const cur = workout(5000, [we('bench', [set(102.5, 3)])]);
    expect(detectPRs(cur, [...history, later], t, false).size).toBe(1);
  });
});
