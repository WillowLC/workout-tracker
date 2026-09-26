import type { Exercise } from './types';

/** Anything on a cable stack: Cable equipment, or "cable" in the name (custom exercises often use Other). */
export function isCableExercise(e: Pick<Exercise, 'equipment' | 'name'> | undefined): boolean {
  return !!e && (e.equipment === 'Cable' || /\bcables?\b/i.test(e.name));
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
