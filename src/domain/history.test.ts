import { describe, expect, it } from 'vitest';
import { monthGrid, monthsBack, recentWeeks, workoutsByDay } from './history';
import { workout } from '../test/fixtures';

const at = (y: number, m: number, d: number, h = 18) => new Date(y, m, d, h).getTime();

describe('calendar', () => {
  // Friday 25 Sep 2026
  const now = at(2026, 8, 25, 20);
  const ws = [workout(at(2026, 8, 8), []), workout(at(2026, 8, 24, 7), []), workout(at(2026, 8, 24, 19), []), workout(at(2026, 6, 3), [])];
  const byDay = workoutsByDay(ws);

  it('recentWeeks: 3 Mon..Sun rows ending with the current week', () => {
    const rows = recentWeeks(byDay, now);
    expect(rows).toHaveLength(3);
    expect(new Date(rows[0][0].date).getDate()).toBe(7); // Mon 7 Sep
    expect(rows[0][1].workouts).toHaveLength(1);
    expect(rows[2][3].workouts).toHaveLength(2); // Thu 24 Sep, two sessions
    expect(rows[2][4].future).toBe(false); // today
    expect(rows[2][5].future).toBe(true);
  });

  it('monthGrid pads to whole Mon..Sun weeks', () => {
    const grid = monthGrid(2026, 8, byDay, now); // Sep 2026 starts on a Tuesday
    expect(grid[0][0]).toBeNull();
    expect(new Date(grid[0][1]!.date).getDate()).toBe(1);
    expect(grid.flat().filter(Boolean)).toHaveLength(30);
    expect(grid.every((r) => r.length === 7)).toBe(true);
  });

  it('monthsBack spans current month back to the first workout, newest first', () => {
    expect(monthsBack(ws, now)).toEqual([{ year: 2026, month: 8 }, { year: 2026, month: 7 }, { year: 2026, month: 6 }]);
    expect(monthsBack([], now)).toEqual([{ year: 2026, month: 8 }]);
  });
});
