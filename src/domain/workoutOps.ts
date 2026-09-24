// Pure, immutable operations on a Workout. The store applies these and persists.
import type { SetType, SetValues, Template, TrackingType, Workout, WorkoutExercise, WorkoutSet } from './types';
import { newId } from './ids';
import { commitSet, hasAnyValue, pickValues, toggleSetType, uncompleteSet } from './sets';
import { normalizeOrder, sortedExercises, blocks } from './superset';
import { defaultSetCount, type PreviousPerformance } from './previous';

export function newSet(type: SetType = 'normal', values: SetValues = {}): WorkoutSet {
  return { id: newId(), type, completed: false, ...values };
}

export function createEmptyWorkout(now: number, name = defaultWorkoutName(now)): Workout {
  return { id: newId(), name, startedAt: now, exercises: [] };
}

export function defaultWorkoutName(now: number): string {
  const h = new Date(now).getHours();
  if (h < 5) return 'Night Workout';
  if (h < 12) return 'Morning Workout';
  if (h < 17) return 'Afternoon Workout';
  if (h < 21) return 'Evening Workout';
  return 'Night Workout';
}

/** Start from a template: structure only — values come from Previous at render time. */
export function workoutFromTemplate(t: Template, now: number): Workout {
  const groupMap = new Map<string, string>();
  const exercises: WorkoutExercise[] = [...t.exercises]
    .sort((a, b) => a.order - b.order)
    .map((te, i) => {
      let g: string | undefined;
      if (te.supersetGroupId) {
        if (!groupMap.has(te.supersetGroupId)) groupMap.set(te.supersetGroupId, newId());
        g = groupMap.get(te.supersetGroupId);
      }
      return {
        id: newId(),
        exerciseId: te.exerciseId,
        order: i,
        supersetGroupId: g,
        sets: (te.sets.length ? te.sets : [{ type: 'normal' as SetType }]).map((s) => newSet(s.type)),
      };
    });
  return { id: newId(), name: t.name, startedAt: now, exercises: normalizeOrder(exercises), templateId: t.id };
}

/** Target reps from the template for a set row, if the workout came from one. */
export function templateTargetReps(t: Template | undefined, we: WorkoutExercise, setIndex: number): number | undefined {
  if (!t) return undefined;
  const te = t.exercises.find((x) => x.exerciseId === we.exerciseId);
  return te?.sets[setIndex]?.targetReps;
}

/** "Repeat workout": same structure (exercises, set types, supersets), fresh values. */
export function repeatWorkout(w: Workout, now: number): Workout {
  const groupMap = new Map<string, string>();
  return {
    id: newId(),
    name: w.name,
    startedAt: now,
    templateId: w.templateId,
    exercises: sortedExercises(w).map((we, i) => {
      let g: string | undefined;
      if (we.supersetGroupId) {
        if (!groupMap.has(we.supersetGroupId)) groupMap.set(we.supersetGroupId, newId());
        g = groupMap.get(we.supersetGroupId);
      }
      return { id: newId(), exerciseId: we.exerciseId, order: i, supersetGroupId: g, sets: we.sets.map((s) => newSet(s.type)) };
    }),
  };
}

export function addExercises(
  w: Workout,
  exerciseIds: string[],
  previousOf: (exerciseId: string) => PreviousPerformance | undefined,
): Workout {
  let order = w.exercises.length;
  const added = exerciseIds.map<WorkoutExercise>((exerciseId) => ({
    id: newId(),
    exerciseId,
    order: order++,
    sets: Array.from({ length: defaultSetCount(previousOf(exerciseId)) }, () => newSet()),
  }));
  return { ...w, exercises: normalizeOrder([...w.exercises, ...added]) };
}

const mapWE = (w: Workout, weId: string, fn: (we: WorkoutExercise) => WorkoutExercise): Workout => ({
  ...w,
  exercises: w.exercises.map((we) => (we.id === weId ? fn(we) : we)),
});

const mapSet = (w: Workout, weId: string, setId: string, fn: (s: WorkoutSet) => WorkoutSet): Workout =>
  mapWE(w, weId, (we) => ({ ...we, sets: we.sets.map((s) => (s.id === setId ? fn(s) : s)) }));

export function removeExercise(w: Workout, weId: string): Workout {
  return { ...w, exercises: normalizeOrder(w.exercises.filter((we) => we.id !== weId)) };
}

/** Keeps the set structure (count + types); memory switches to the new exercise, so values reset. */
export function replaceExercise(w: Workout, weId: string, exerciseId: string): Workout {
  return mapWE(w, weId, (we) => ({ ...we, exerciseId, sets: we.sets.map((s) => newSet(s.type)) }));
}

export function updateWorkoutExercise(w: Workout, weId: string, patch: Partial<Pick<WorkoutExercise, 'sessionNote'>>): Workout {
  return mapWE(w, weId, (we) => ({ ...we, ...patch }));
}

/** "+ Add Set" copies the values of the last set (not its completion). */
export function addSet(w: Workout, weId: string): Workout {
  return mapWE(w, weId, (we) => {
    const last = we.sets[we.sets.length - 1];
    const type: SetType = last && last.type !== 'warmup' && last.type !== 'drop' ? last.type : 'normal';
    return { ...we, sets: [...we.sets, newSet(type, last ? pickValues(last) : {})] };
  });
}

export function removeSet(w: Workout, weId: string, setId: string): Workout {
  return mapWE(w, weId, (we) => ({ ...we, sets: we.sets.filter((s) => s.id !== setId) }));
}

export function updateSet(w: Workout, weId: string, setId: string, patch: SetValues): Workout {
  return mapSet(w, weId, setId, (s) => {
    const next = { ...s, ...patch };
    for (const k of Object.keys(patch) as (keyof SetValues)[]) if (patch[k] === undefined) delete next[k];
    return next;
  });
}

export function setSetType(w: Workout, weId: string, setId: string, type: SetType): Workout {
  return mapSet(w, weId, setId, (s) => ({ ...s, type: toggleSetType(s.type, type) }));
}

/** Toggle completion. Completing commits placeholder values; returns null if values are missing. */
export function toggleSetComplete(
  w: Workout,
  weId: string,
  setId: string,
  placeholder: SetValues | undefined,
  t: TrackingType,
  now: number,
): Workout | null {
  const we = w.exercises.find((e) => e.id === weId);
  const set = we?.sets.find((s) => s.id === setId);
  if (!set) return null;
  if (set.completed) return mapSet(w, weId, setId, uncompleteSet);
  const committed = commitSet(set, placeholder, t, now);
  if (!committed) return null;
  return mapSet(w, weId, setId, () => committed);
}

/** Link two exercises (or add to an existing group). Supports 3+ exercise giant sets. */
export function linkSuperset(w: Workout, weIdA: string, weIdB: string): Workout {
  const a = w.exercises.find((e) => e.id === weIdA);
  const b = w.exercises.find((e) => e.id === weIdB);
  if (!a || !b || a.id === b.id) return w;
  const gA = a.supersetGroupId;
  const gB = b.supersetGroupId;
  const target = gA ?? gB ?? newId();
  const exercises = w.exercises.map((e) => {
    if (e.id === a.id || e.id === b.id) return { ...e, supersetGroupId: target };
    if (gB && gA && e.supersetGroupId === gB) return { ...e, supersetGroupId: target }; // merge groups
    return e;
  });
  // normalizeOrder places the whole group at its first member's position.
  return { ...w, exercises: normalizeOrder(exercises) };
}

export function unlinkSuperset(w: Workout, weId: string): Workout {
  return { ...w, exercises: normalizeOrder(w.exercises.map((e) => (e.id === weId ? { ...e, supersetGroupId: undefined } : e))) };
}

/** Move a block (single exercise or whole superset) from one block index to another. */
export function moveBlock<T extends { order: number; supersetGroupId?: string }>(items: T[], from: number, to: number): T[] {
  const bl = blocks(items);
  if (from < 0 || from >= bl.length || to < 0 || to >= bl.length) return items;
  const [moved] = bl.splice(from, 1);
  bl.splice(to, 0, moved);
  return bl.flat().map((it, i) => ({ ...it, order: i }));
}

export function reorderWorkout(w: Workout, from: number, to: number): Workout {
  return { ...w, exercises: moveBlock(w.exercises, from, to) };
}

/** Uncompleted sets where the user typed something. */
export function pendingSetsWithValues(w: Workout, trackingOf: (id: string) => TrackingType | undefined): number {
  let n = 0;
  for (const we of w.exercises) {
    const t = trackingOf(we.exerciseId) ?? 'weight_reps';
    for (const s of we.sets) if (!s.completed && hasAnyValue(s, t)) n++;
  }
  return n;
}

/**
 * Prepare a workout for saving. 'complete' checks off uncompleted sets that
 * have values (using placeholders for gaps); anything still uncompleted is
 * dropped, then exercises with no sets are dropped.
 */
export function finalizeWorkout(
  w: Workout,
  mode: 'complete' | 'discard',
  trackingOf: (id: string) => TrackingType | undefined,
  placeholderOf: (weId: string, setId: string) => SetValues | undefined,
  now: number,
): Workout {
  const exercises = w.exercises
    .map((we) => {
      const t = trackingOf(we.exerciseId) ?? 'weight_reps';
      const sets = we.sets
        .map((s) => {
          if (s.completed) return s;
          if (mode === 'complete' && hasAnyValue(s, t)) return commitSet(s, placeholderOf(we.id, s.id), t, now) ?? s;
          return s;
        })
        .filter((s) => s.completed);
      return { ...we, sets };
    })
    .filter((we) => we.sets.length > 0);
  return { ...w, exercises: normalizeOrder(exercises), finishedAt: now };
}
