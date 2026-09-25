import { describe, expect, it } from 'vitest';
import { comparisonFor, formatBigWeight, formatComparison, niceCount, pickComparison, seededRng } from './volumeComparison';
import { VOLUME_COMPARISONS, type VolumeComparison } from '../data/volumeComparisons';

const item = (id: string, kg: number): VolumeComparison => ({ id, singular: id, plural: `${id}s`, kg, emoji: '', category: 'object' });

describe('volume comparison library', () => {
  it('has 80+ items with unique ids, spread across every range', () => {
    expect(VOLUME_COMPARISONS.length).toBeGreaterThanOrEqual(80);
    expect(new Set(VOLUME_COMPARISONS.map((c) => c.id)).size).toBe(VOLUME_COMPARISONS.length);
    const inRange = (lo: number, hi: number) => VOLUME_COMPARISONS.filter((c) => c.kg > lo && c.kg <= hi).length;
    for (const [lo, hi] of [[0, 100], [100, 1000], [1000, 10_000], [10_000, 100_000], [100_000, Infinity]]) expect(inRange(lo, hi)).toBeGreaterThanOrEqual(15);
  });
  it('every plausible volume from 20 kg to 100,000 t has an item that fits 1–20×', () => {
    for (let v = 20; v < 1e8; v *= 1.3) expect(pickComparison(v, [], () => 0)?.fits).toBe(true);
  });
});

describe('pickComparison', () => {
  const lib = [item('piano', 450), item('cow', 650), item('whale', 150_000), item('bar', 20)];

  it('only picks items the volume fits 1–20 times', () => {
    for (let i = 0; i < 20; i++) {
      const p = pickComparison(3150, [], Math.random, lib)!;
      expect(['piano', 'cow']).toContain(p.item.id);
    }
  });
  it('prefers counts that round nicely', () => {
    // 3150 / 450 = exactly 7; 3150 / 650 = 4.85 (not nice).
    const picks = new Set(Array.from({ length: 10 }, (_, i) => pickComparison(3150, [], () => i / 10, [item('piano', 450), item('cow', 650), ...Array.from({ length: 5 }, (_, k) => item(`n${k}`, 3150 / (7 + k)))])!.item.id));
    expect(picks.has('cow')).toBe(false);
  });
  it('never repeats one of the last 5 used', () => {
    const p = pickComparison(3150, ['piano'], () => 0, lib)!;
    expect(p.item.id).toBe('cow');
    // Only older than the last five → allowed again.
    expect(pickComparison(3150, ['piano', 'a', 'b', 'c', 'd', 'e'], () => 0, [item('piano', 450)])!.item.id).toBe('piano');
  });
  it('nothing fits → the closest item with a decimal', () => {
    const p = pickComparison(60_000, [], () => 0, [item('whale', 150_000)])!;
    expect(p.fits).toBe(false);
    expect(p.count).toBe(0.4);
    expect(formatComparison(p)).toBe('0.4 whales');
  });
  it('formats "about N plurals", halves, and "about a/an" for ≈1', () => {
    expect(formatComparison(comparisonFor(3150, item('grand piano', 450)))).toBe('about 7 grand pianos');
    expect(formatComparison(comparisonFor(1125, item('piano', 450)))).toBe('about 2½ pianos');
    expect(formatComparison(comparisonFor(500, item('piano', 450)))).toBe('about a piano');
    expect(formatComparison(comparisonFor(80, { ...item('x', 70), singular: 'adult human' }))).toBe('about an adult human');
    expect(niceCount(12.4)).toBe(12);
    expect(niceCount(3.3)).toBe(3.5);
  });
  it('seeded picks are stable', () => {
    const a = pickComparison(123_456, [], seededRng('2026-09'));
    const b = pickComparison(123_456, [], seededRng('2026-09'));
    expect(a?.item.id).toBe(b?.item.id);
  });
  it('formats big totals', () => {
    expect(formatBigWeight(8450, 'kg')).toBe('8,450 kg');
    expect(formatBigWeight(1_234_567, 'kg')).toBe('1.2 million kg');
  });
});
