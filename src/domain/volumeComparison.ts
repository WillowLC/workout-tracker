// "You lifted 8,450 kg — that's about 7 grand pianos 🎹"
import type { VolumeComparison } from '../data/volumeComparisons';
import { VOLUME_COMPARISONS } from '../data/volumeComparisons';
import type { Settings } from './types';
import { toDisplayWeight } from './units';

export const RECENT_COMPARISONS_KEPT = 5;
const TOP_CANDIDATES = 5;

/** The "nice" count a ratio rounds to: halves below 10, whole numbers from 10. */
export function niceCount(ratio: number): number {
  return ratio < 10 ? Math.round(ratio * 2) / 2 : Math.round(ratio);
}

/** Relative distance from a nice count (0 = exactly 3, 3½, 12…). */
export function niceness(ratio: number): number {
  return Math.abs(ratio - niceCount(ratio)) / ratio;
}

export interface ComparisonPick {
  item: VolumeComparison;
  /** Count to show: nice when the item fits (1–20), a decimal otherwise. */
  count: number;
  fits: boolean;
}

/** The count to show for a given item (used when re-opening a stored pick). */
export function comparisonFor(volumeKg: number, item: VolumeComparison): ComparisonPick {
  const ratio = volumeKg / item.kg;
  const fits = ratio >= 1 && ratio <= 20;
  return { item, fits, count: fits ? niceCount(ratio) : ratio >= 10 ? Math.round(ratio) : Math.round(ratio * 10) / 10 };
}

/**
 * Pick an item whose weight fits the volume 1–20 times, preferring counts
 * that round nicely, randomly among the top candidates, never one of
 * `recentIds`. If nothing fits, the closest item (shown with a decimal).
 */
export function pickComparison(
  volumeKg: number,
  recentIds: string[] = [],
  rng: () => number = Math.random,
  items: VolumeComparison[] = VOLUME_COMPARISONS,
): ComparisonPick | undefined {
  if (!(volumeKg > 0) || !items.length) return undefined;
  const recent = new Set(recentIds.slice(-RECENT_COMPARISONS_KEPT));
  const fitting = items.filter((it) => {
    const r = volumeKg / it.kg;
    return r >= 1 && r <= 20;
  });
  const fresh = fitting.filter((it) => !recent.has(it.id));
  const pool = fresh.length ? fresh : fitting;
  if (pool.length) {
    const ranked = [...pool].sort((a, b) => niceness(volumeKg / a.kg) - niceness(volumeKg / b.kg));
    const top = ranked.slice(0, TOP_CANDIDATES);
    return comparisonFor(volumeKg, top[Math.min(top.length - 1, Math.floor(rng() * top.length))]);
  }
  const closest = [...items].sort((a, b) => Math.abs(Math.log(volumeKg / a.kg)) - Math.abs(Math.log(volumeKg / b.kg)))[0];
  return comparisonFor(volumeKg, closest);
}

function formatCount(n: number): string {
  const whole = Math.floor(n);
  const frac = n - whole;
  if (Math.abs(frac - 0.5) < 1e-9) return whole ? `${whole}½` : '½';
  return n.toLocaleString('en-US', { maximumFractionDigits: 1 });
}

/** "7 grand pianos", "a hippo", "0.4 blue whales". */
export function comparisonPhrase(p: ComparisonPick): string {
  const { item, count } = p;
  if (p.fits && count === 1) return `${/^[aeiou]/i.test(item.singular) ? 'an' : 'a'} ${item.singular}`;
  return `${formatCount(count)} ${count === 1 ? item.singular : item.plural}`;
}

/** "about 7 grand pianos", "about a hippo", "0.4 blue whales". */
export function formatComparison(p: ComparisonPick): string {
  return p.fits ? `about ${comparisonPhrase(p)}` : comparisonPhrase(p);
}

/** Deterministic 0–1 generator from a string (stable picks for recaps). */
export function seededRng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** "8,450 kg", "845,300 kg", "1.2 million kg" in the user's unit. */
export function formatBigWeight(kg: number, unit: Settings['unit']): string {
  const v = toDisplayWeight(kg, unit);
  if (v >= 1e9) return `${(v / 1e9).toLocaleString('en-US', { maximumFractionDigits: 1 })} billion ${unit}`;
  if (v >= 1e6) return `${(v / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1 })} million ${unit}`;
  return `${Math.round(v).toLocaleString('en-US')} ${unit}`;
}
