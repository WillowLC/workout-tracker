import type { FolderInfo, Template, TemplateExercise, TemplateSet, WeekPlan, Workout } from './types';
import { newId } from './ids';
import { normalizeOrder, sortedExercises } from './superset';

export function templateFromWorkout(w: Workout, name: string, base?: Template): Template {
  const exercises: TemplateExercise[] = sortedExercises(w).map((we, i) => {
    const prev = base?.exercises.find((e) => e.exerciseId === we.exerciseId);
    return {
      exerciseId: we.exerciseId,
      order: i,
      supersetGroupId: we.supersetGroupId,
      // Keep target reps from the template where the set still exists.
      sets: we.sets.map((s, si) => ({ type: s.type, targetReps: prev?.sets[si]?.targetReps })),
    };
  });
  return { id: base?.id ?? newId(), name, folder: base?.folder, exercises };
}

/** Structure signature: exercise order, set types, superset grouping (by position). */
function signature(items: { exerciseId: string; order: number; supersetGroupId?: string; sets: { type: string }[] }[]): string {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  const groupIdx = new Map<string, number>();
  return JSON.stringify(
    sorted.map((e) => {
      let g: number | null = null;
      if (e.supersetGroupId) {
        if (!groupIdx.has(e.supersetGroupId)) groupIdx.set(e.supersetGroupId, groupIdx.size);
        g = groupIdx.get(e.supersetGroupId)!;
      }
      return [e.exerciseId, g, e.sets.map((s) => s.type)];
    }),
  );
}

export function workoutMatchesTemplate(w: Workout, t: Template): boolean {
  return signature(w.exercises) === signature(t.exercises);
}

export function emptyTemplate(name = 'New Template'): Template {
  return { id: newId(), name, exercises: [] };
}

export function duplicateTemplate(t: Template): Template {
  return { ...structuredClone(t), id: newId(), name: `${t.name} (copy)` };
}

export function addTemplateExercises(t: Template, exerciseIds: string[]): Template {
  let order = t.exercises.length;
  const added = exerciseIds.map<TemplateExercise>((exerciseId) => ({
    exerciseId,
    order: order++,
    sets: [{ type: 'normal' }, { type: 'normal' }, { type: 'normal' }],
  }));
  return { ...t, exercises: normalizeOrder([...t.exercises, ...added]) };
}

const byOrderThenName = (a: { order?: number; name: string }, b: { order?: number; name: string }) =>
  (a.order ?? Infinity) - (b.order ?? Infinity) || a.name.localeCompare(b.name);

/**
 * Group templates by folder; unfiled templates come first under "".
 * Folders follow their saved order (then name); templates their `order` (then name).
 */
export function groupTemplatesByFolder(templates: Template[], folders: FolderInfo[] = []): [string, Template[]][] {
  const map = new Map<string, Template[]>();
  for (const t of [...templates].sort(byOrderThenName)) {
    const k = t.folder?.trim() ?? '';
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(t);
  }
  const folderOrder = new Map(folders.map((f) => [f.name, f.order]));
  return [...map.entries()].sort(([a], [b]) =>
    a === '' ? -1 : b === '' ? 1 : byOrderThenName({ name: a, order: folderOrder.get(a) }, { name: b, order: folderOrder.get(b) }),
  );
}

/** Distinct folder names in display order. */
export function folderNames(templates: Template[], folders: FolderInfo[] = []): string[] {
  return groupTemplatesByFolder(templates, folders).map(([f]) => f).filter(Boolean);
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Give templates consecutive `order` values in the given sequence; returns only those whose order changed. */
export function renumberTemplates(list: Template[]): Template[] {
  return list.map((t, i) => (t.order === i ? t : { ...t, order: i })).filter((t, i) => t !== list[i]);
}

/** Set folder `order` to match the given sequence of names, keeping plans. */
export function reorderFolders(folders: FolderInfo[], names: string[]): FolderInfo[] {
  const rest = folders.filter((f) => !names.includes(f.name));
  return [...names.map((name, order) => ({ ...folders.find((f) => f.name === name), name, order })), ...rest];
}

export const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

/** Index into a WeekPlan (Monday = 0) for a timestamp. */
export function weekdayIndex(ts: number): number {
  return (new Date(ts).getDay() + 6) % 7;
}

export function emptyWeekPlan(): WeekPlan {
  return Array(7).fill(null);
}

export function setPlanDay(folders: FolderInfo[], name: string, day: number, templateId: string | null): FolderInfo[] {
  const cur = folders.find((f) => f.name === name);
  const plan = [...(cur?.plan ?? emptyWeekPlan())];
  plan[day] = templateId;
  return cur ? folders.map((f) => (f === cur ? { ...f, plan } : f)) : [...folders, { name, plan }];
}

/** Rename a folder's settings entry (templates are renamed separately). */
export function renameFolderInfo(folders: FolderInfo[], from: string, to: string): FolderInfo[] {
  return folders.filter((f) => f.name !== to).map((f) => (f.name === from ? { ...f, name: to } : f));
}

// ---- Template editing (template exercises are addressed by their `order`) ----

const mapTE = (t: Template, order: number, fn: (te: TemplateExercise) => TemplateExercise): Template => ({
  ...t,
  exercises: t.exercises.map((te) => (te.order === order ? fn(te) : te)),
});

export function removeTemplateExercise(t: Template, order: number): Template {
  return { ...t, exercises: normalizeOrder(t.exercises.filter((te) => te.order !== order)) };
}

export function addTemplateSet(t: Template, order: number): Template {
  return mapTE(t, order, (te) => {
    const last = te.sets[te.sets.length - 1];
    return { ...te, sets: [...te.sets, { type: last?.type === 'failure' ? 'failure' : 'normal', targetReps: last?.targetReps }] };
  });
}

export function removeTemplateSet(t: Template, order: number, index: number): Template {
  return mapTE(t, order, (te) => ({ ...te, sets: te.sets.filter((_, i) => i !== index) }));
}

export function setTemplateSet(t: Template, order: number, index: number, patch: Partial<TemplateSet>): Template {
  return mapTE(t, order, (te) => ({ ...te, sets: te.sets.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));
}

export function linkTemplateSuperset(t: Template, orderA: number, orderB: number): Template {
  const a = t.exercises.find((e) => e.order === orderA);
  const b = t.exercises.find((e) => e.order === orderB);
  if (!a || !b || a === b) return t;
  const target = a.supersetGroupId ?? b.supersetGroupId ?? newId();
  const gB = b.supersetGroupId;
  const exercises = t.exercises.map((e) =>
    e === a || e === b || (gB && a.supersetGroupId && e.supersetGroupId === gB) ? { ...e, supersetGroupId: target } : e,
  );
  return { ...t, exercises: normalizeOrder(exercises) };
}

export function unlinkTemplateSuperset(t: Template, order: number): Template {
  return { ...t, exercises: normalizeOrder(t.exercises.map((e) => (e.order === order ? { ...e, supersetGroupId: undefined } : e))) };
}
