import type { Exercise, Settings, Workout, WorkoutExercise, WorkoutSet } from './types';

export function sortedExercises<T extends { order: number }>(w: { exercises: T[] }): T[] {
  return [...w.exercises].sort((a, b) => a.order - b.order);
}

/** Exercises in order, grouped into blocks: each superset is one block, others are singletons. */
export function blocks<T extends { order: number; supersetGroupId?: string }>(items: T[]): T[][] {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const out: T[][] = [];
  const seen = new Map<string, T[]>();
  for (const it of sorted) {
    const g = it.supersetGroupId;
    if (g && seen.has(g)) {
      seen.get(g)!.push(it);
      continue;
    }
    const block = [it];
    if (g) seen.set(g, block);
    out.push(block);
  }
  return out;
}

/** Re-number `order` so superset members are adjacent; drop groups with a single member. */
export function normalizeOrder<T extends { order: number; supersetGroupId?: string }>(items: T[]): T[] {
  const counts = new Map<string, number>();
  for (const it of items) if (it.supersetGroupId) counts.set(it.supersetGroupId, (counts.get(it.supersetGroupId) ?? 0) + 1);
  const cleaned = items.map((it) =>
    it.supersetGroupId && counts.get(it.supersetGroupId)! < 2 ? { ...it, supersetGroupId: undefined } : it,
  );
  return blocks(cleaned)
    .flat()
    .map((it, i) => ({ ...it, order: i }));
}

export interface SupersetInfo {
  letter: string;
  colorIndex: number; // 0..3, maps to --color-superset-N
  size: number;
}

/** "Superset A", "B"… assigned by first appearance. */
export function supersetInfo<T extends { order: number; supersetGroupId?: string }>(items: T[]): Map<string, SupersetInfo> {
  const map = new Map<string, SupersetInfo>();
  let g = 0;
  for (const block of blocks(items)) {
    const gid = block[0].supersetGroupId;
    if (!gid || block.length < 2) continue;
    map.set(gid, { letter: String.fromCharCode(65 + (g % 26)), colorIndex: g % 4, size: block.length });
    g++;
  }
  return map;
}

/** Split an exercise's sets into rounds: each non-drop set starts a round; drop sets attach to it. */
export function rounds(sets: WorkoutSet[]): WorkoutSet[][] {
  const out: WorkoutSet[][] = [];
  for (const s of sets) {
    if (s.type === 'drop' && out.length) out[out.length - 1].push(s);
    else out.push([s]);
  }
  return out;
}

export interface AfterCompleteResult {
  startRest: boolean;
  /** WorkoutExercise whose rest duration applies. */
  restFromWorkoutExerciseId?: string;
  /** Set to highlight/scroll to next. */
  nextSetId?: string;
}

/**
 * What happens after a set is checked off:
 * - If the next set of the same exercise is a drop set → no rest, go to it.
 * - In a superset, the rest timer starts only once every member's set in this
 *   round is done (i.e. after the last exercise of the round); until then
 *   focus moves to the next member's set in the same round.
 * - A normal exercise is a superset of one, so it always rests.
 */
export function afterSetCompleted(w: Workout, weId: string, setId: string): AfterCompleteResult {
  const all = sortedExercises(w);
  const we = all.find((e) => e.id === weId);
  if (!we) return { startRest: false };
  const idx = we.sets.findIndex((s) => s.id === setId);
  if (idx < 0) return { startRest: false };

  const following = we.sets[idx + 1];
  if (following && following.type === 'drop' && !following.completed) {
    return { startRest: false, nextSetId: following.id };
  }

  const members = we.supersetGroupId ? all.filter((e) => e.supersetGroupId === we.supersetGroupId) : [we];
  const roundIdx = rounds(we.sets).findIndex((r) => r.some((s) => s.id === setId));
  const p = members.findIndex((m) => m.id === we.id);

  // Look for an unfinished set in the same round, starting after this member (wrapping).
  for (let k = 1; k < members.length; k++) {
    const m = members[(p + k) % members.length];
    const r = rounds(m.sets)[roundIdx];
    const open = r?.find((s) => !s.completed);
    if (open) return { startRest: false, nextSetId: open.id };
  }

  return { startRest: true, restFromWorkoutExerciseId: we.id, nextSetId: nextOpenSet(all, members)?.id };
}

function nextOpenSet(all: WorkoutExercise[], members: WorkoutExercise[]): WorkoutSet | undefined {
  // Earliest open round within the group, member order.
  const maxRounds = Math.max(...members.map((m) => rounds(m.sets).length));
  for (let r = 0; r < maxRounds; r++) {
    for (const m of members) {
      const open = rounds(m.sets)[r]?.find((s) => !s.completed);
      if (open) return open;
    }
  }
  // Otherwise the first open set in any later exercise.
  const lastOrder = Math.max(...members.map((m) => m.order));
  for (const e of all) {
    if (e.order <= lastOrder) continue;
    const open = e.sets.find((s) => !s.completed);
    if (open) return open;
  }
  return undefined;
}

export function restSecondsFor(we: WorkoutExercise | undefined, ex: Exercise | undefined, settings: Settings): number {
  return we?.restSeconds ?? ex?.defaultRestSeconds ?? settings.defaultRestSeconds;
}
