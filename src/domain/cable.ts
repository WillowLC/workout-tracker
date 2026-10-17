import type { Exercise } from './types';

// Movements that are (almost) always done on a cable stack, for custom
// exercises whose equipment was left as Other.
const CABLE_WORDS = /\b(cables?|pulley|crossovers?|push-?downs?|pull-?downs?|face pulls?|pallof|woodchop(per)?s?|archer pulls?(?!\s*-?\s*ups?))\b/i;

/**
 * Anything on a cable stack: Cable equipment, "cable" in the name, or (for
 * custom exercises left as Other) a movement that's done on cables.
 */
export function isCableExercise(e: Pick<Exercise, 'equipment' | 'name'> | undefined): boolean {
  if (!e) return false;
  if (e.equipment === 'Cable' || /\bcables?\b/i.test(e.name)) return true;
  return e.equipment === 'Other' && CABLE_WORDS.test(e.name);
}

/** Pulley height is per gym (every gym's cable stack is numbered differently); '' = no gym. */
export function cableHeightFor(e: Pick<Exercise, 'cableHeights'> | undefined, gymId?: string): string | undefined {
  return e?.cableHeights?.[gymId ?? ''];
}

export function withCableHeight<E extends Pick<Exercise, 'cableHeights'>>(e: E, gymId: string | undefined, height: string | undefined): E {
  const next = { ...e.cableHeights };
  const key = gymId ?? '';
  const v = height?.trim();
  if (v) next[key] = v;
  else delete next[key];
  return { ...e, cableHeights: Object.keys(next).length ? next : undefined };
}
