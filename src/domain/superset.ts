import type { Workout, WorkoutExercise, WorkoutSet } from './types';

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
    if (s.type === 'warmup') continue; // warm-ups sit outside superset rounds
    if (s.type === 'drop' && out.length) out[out.length - 1].push(s);
    else out.push([s]);
  }
  return out;
}

const openWarmup = (we: WorkoutExercise) => we.sets.find((s) => s.type === 'warmup' && !s.completed);

export interface AfterCompleteResult {
  /** Set to highlight/scroll to next. */
  nextSetId?: string;
}

/**
 * Which set to highlight after one is checked off:
 * - If the next set of the same exercise is a drop set → that drop set.
 * - After a warm-up → the next open set of the same exercise.
 * - In a superset, the same round of the next member (A1 → B1 → A2 …), until
 *   every member has finished the round. Warm-ups are not rounds: a member's
 *   open warm-ups come before its first working set.
 * - Otherwise the earliest open set in the group, then the next exercise.
 */
export function afterSetCompleted(w: Workout, weId: string, setId: string): AfterCompleteResult {
  const all = sortedExercises(w);
  const we = all.find((e) => e.id === weId);
  if (!we) return {};
  const idx = we.sets.findIndex((s) => s.id === setId);
  if (idx < 0) return {};
  const set = we.sets[idx];

  const following = we.sets[idx + 1];
  if (following && following.type === 'drop' && !following.completed) {
    return { nextSetId: following.id };
  }

  const members = we.supersetGroupId ? all.filter((e) => e.supersetGroupId === we.supersetGroupId) : [we];

  if (set.type === 'warmup') {
    const next = we.sets.slice(idx + 1).find((s) => !s.completed);
    return { nextSetId: (next ?? nextOpenSet(all, members))?.id };
  }

  const roundIdx = rounds(we.sets).findIndex((r) => r.some((s) => s.id === setId));
  const p = members.findIndex((m) => m.id === we.id);

  // Look for an unfinished set in the same round, starting after this member (wrapping).
  for (let k = 1; k < members.length; k++) {
    const m = members[(p + k) % members.length];
    const r = rounds(m.sets)[roundIdx];
    const open = r?.find((s) => !s.completed);
    if (open) return { nextSetId: (roundIdx === 0 && openWarmup(m)) ? openWarmup(m)!.id : open.id };
  }

  return { nextSetId: nextOpenSet(all, members)?.id };
}

function nextOpenSet(all: WorkoutExercise[], members: WorkoutExercise[]): WorkoutSet | undefined {
  // Earliest open round within the group, member order (open warm-ups first).
  const maxRounds = Math.max(...members.map((m) => rounds(m.sets).length));
  for (let r = 0; r < maxRounds; r++) {
    for (const m of members) {
      const open = rounds(m.sets)[r]?.find((s) => !s.completed);
      if (open) return (r === 0 && openWarmup(m)) || open;
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
