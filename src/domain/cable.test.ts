import { describe, expect, it } from 'vitest';
import { SEED_EXERCISES } from '../db/seed';
import { cableHeightFor, isCableExercise, withCableHeight } from './cable';

describe('cable height', () => {
  it('treats every built-in cable exercise as a cable exercise', () => {
    const cable = SEED_EXERCISES.filter((e) => /cable/i.test(e.name) || e.equipment === 'Cable');
    expect(cable.length).toBeGreaterThan(20);
    for (const e of cable) expect(isCableExercise(e), e.name).toBe(true);
    expect(isCableExercise({ name: 'Rope Thing', equipment: 'Other' })).toBe(false);
    expect(isCableExercise({ name: 'Cable Row (custom)', equipment: 'Other' })).toBe(true);
  });

  it('stores height per gym and clears empty values', () => {
    let e = withCableHeight({ cableHeights: undefined }, 'g1', ' 12 ');
    e = withCableHeight(e, undefined, 'low');
    expect(cableHeightFor(e, 'g1')).toBe('12');
    expect(cableHeightFor(e)).toBe('low');
    expect(cableHeightFor(e, 'g2')).toBeUndefined();
    e = withCableHeight(withCableHeight(e, 'g1', ''), undefined, undefined);
    expect(e.cableHeights).toBeUndefined();
  });
});
