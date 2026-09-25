import { describe, expect, it } from 'vitest';
import { drawInspiration, INSPIRATIONS, ordinal } from './inspiration';

describe('inspiration', () => {
  it('has at least 100 unique entries', () => {
    expect(INSPIRATIONS.length).toBeGreaterThanOrEqual(100);
    expect(new Set(INSPIRATIONS.map((i) => i.text)).size).toBe(INSPIRATIONS.length);
  });

  it('shows every entry once before any repeats, and never the same one twice in a row', () => {
    let deck: number[] | undefined;
    let last: number | undefined;
    const seen: number[] = [];
    for (let i = 0; i < INSPIRATIONS.length * 3; i++) {
      const r = drawInspiration(deck, last);
      expect(r.index).not.toBe(last);
      seen.push(r.index);
      deck = r.deck;
      last = r.index;
    }
    for (let round = 0; round < 3; round++) {
      const chunk = seen.slice(round * INSPIRATIONS.length, (round + 1) * INSPIRATIONS.length);
      expect(new Set(chunk).size).toBe(INSPIRATIONS.length);
    }
  });

  it('drops stale indices from a saved deck', () => {
    expect(drawInspiration([999, 3], undefined, 10).index).toBe(3);
  });

  it('ordinal suffixes', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd', '101st', '111th']);
  });
});
