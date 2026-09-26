import type { FolderInfo, FolderMode, Template, Workout } from './types';
import { WEEK_DAYS, weekdayIndex } from './templates';

// "What should I do today?" for a folder. A folder is scheduled either by
// weekday (FolderInfo.plan) or as a repeating cycle of workouts and rest days
// (FolderInfo.cycle), e.g. Push, Pull, Legs, Rest. A cycle is independent of
// the weekday: your place in it comes from the workouts you actually did.

/** Folders with a weekly plan default to weekly; everything else cycles through its templates in order. */
export function folderMode(info?: FolderInfo): FolderMode {
  if (info?.mode) return info.mode;
  return info?.plan?.some(Boolean) ? 'weekly' : 'cycle';
}

/**
 * The cycle's slots (template ID, or null for a rest day), ignoring templates
 * that were deleted or moved out of the folder. With no saved cycle: every
 * template in folder order, no rest days.
 */
export function cycleSlots(info: FolderInfo | undefined, list: Template[]): (string | null)[] {
  const ids = new Set(list.map((t) => t.id));
  const saved = info?.cycle?.filter((id) => id === null || ids.has(id));
  return saved?.some(Boolean) ? saved : list.map((t) => t.id);
}

/** Calendar-day number (local time), so "days between" ignores the hour and DST. */
export function dayNumber(ts: number): number {
  const d = new Date(ts);
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

export interface DaySuggestion {
  folder: string;
  mode: FolderMode;
  /** Today's workout; undefined = rest day. */
  templateId?: string;
  /** A workout from this folder was already done today. */
  doneToday: boolean;
  /** The next workout after today, and how many days away it is. */
  next?: { templateId: string; inDays: number };
  /** Cycle only: index of today's slot. */
  slot?: number;
}

/** "Tomorrow", "Thursday", or "in 9 days". */
export function whenLabel(inDays: number, now: number): string {
  if (inDays <= 0) return 'Today';
  if (inDays === 1) return 'Tomorrow';
  if (inDays < 7) return WEEK_DAYS[(weekdayIndex(now) + inDays) % 7];
  return `in ${inDays} days`;
}

function nextInCycle(slots: (string | null)[], from: number): { templateId: string; inDays: number; slot: number } | undefined {
  for (let k = 0; k < slots.length; k++) {
    const i = (from + k) % slots.length;
    if (slots[i]) return { templateId: slots[i]!, inDays: k + 1, slot: i };
  }
  return undefined;
}

/** Where in the cycle the folder's history leaves you: last slot done and on which day. */
function cyclePosition(slots: (string | null)[], history: Workout[]): { slot: number; day: number } | undefined {
  let pos: { slot: number; day: number } | undefined;
  for (const w of [...history].sort((a, b) => a.startedAt - b.startedAt)) {
    // A template can appear more than once in a cycle: take the next occurrence after the last one done.
    const from = pos ? pos.slot + 1 : 0;
    for (let k = 0; k < slots.length; k++) {
      const i = (from + k) % slots.length;
      if (slots[i] === w.templateId) { pos = { slot: i, day: dayNumber(w.startedAt) }; break; }
    }
  }
  return pos;
}

/** Today's workout for one folder. `list` is the folder's templates in order; `workouts` is all history. */
export function suggestForFolder(folder: string, info: FolderInfo | undefined, list: Template[], workouts: Workout[], now: number): DaySuggestion | undefined {
  const ids = new Set(list.map((t) => t.id));
  const history = workouts.filter((w) => w.templateId && ids.has(w.templateId) && w.startedAt <= now);
  const today = dayNumber(now);
  const doneToday = history.some((w) => dayNumber(w.startedAt) === today);
  const mode = folderMode(info);

  if (mode === 'weekly') {
    const plan = info?.plan ?? [];
    const wd = weekdayIndex(now);
    const pick = (i: number) => (plan[i] && ids.has(plan[i]!) ? plan[i]! : undefined);
    let next: DaySuggestion['next'];
    for (let d = 1; d <= 7 && !next; d++) {
      const id = pick((wd + d) % 7);
      if (id) next = { templateId: id, inDays: d };
    }
    if (!pick(wd) && !next) return undefined;
    return { folder, mode, templateId: pick(wd), doneToday, next };
  }

  const slots = cycleSlots(info, list);
  if (!slots.some(Boolean)) return undefined;
  const pos = cyclePosition(slots, history);
  if (!pos) {
    const first = nextInCycle(slots, 0)!;
    return { folder, mode, templateId: first.templateId, doneToday: false, slot: first.slot, next: nextInCycle(slots, first.slot + 1) };
  }
  if (pos.day === today) {
    return { folder, mode, templateId: slots[pos.slot]!, doneToday: true, slot: pos.slot, next: nextInCycle(slots, pos.slot + 1) };
  }
  // Each day since the last workout uses up one rest slot. A workout slot waits
  // for you, so missing a day never skips a workout.
  let i = (pos.slot + 1) % slots.length;
  for (let day = pos.day + 1; day < today && slots[i] === null; day++) i = (i + 1) % slots.length;
  return { folder, mode, templateId: slots[i] ?? undefined, doneToday: false, slot: i, next: nextInCycle(slots, i + 1) };
}

/**
 * The folder you're currently following: the one your most recent template
 * workout came from. Falls back to the first folder that has a weekly plan,
 * then the first folder.
 */
export function currentFolder(groups: [string, Template[]][], folders: FolderInfo[], workouts: Workout[]): string | undefined {
  const folderOf = new Map<string, string>();
  for (const [f, list] of groups) for (const t of list) folderOf.set(t.id, f);
  let latest: Workout | undefined;
  for (const w of workouts) if (w.templateId && folderOf.has(w.templateId) && (!latest || w.startedAt > latest.startedAt)) latest = w;
  if (latest) return folderOf.get(latest.templateId!);
  const named = groups.filter(([f, l]) => f && l.length);
  return (named.find(([f]) => folders.find((x) => x.name === f)?.plan?.some(Boolean)) ?? named[0] ?? groups.find(([, l]) => l.length))?.[0];
}
