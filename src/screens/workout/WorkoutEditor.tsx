// Container that edits a Workout (the active one, or a past one). Owns menus
// and sheets; renders visual components with plain props.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SetType, Template, Workout } from '../../domain/types';
import {
  addExercises, addSet, linkSuperset, removeExercise, removeSet, reorderWorkout, replaceExercise,
  setSetType, toggleSetComplete, unlinkSuperset, updateSet, updateWorkoutExercise,
} from '../../domain/workoutOps';
import { afterSetCompleted, blocks, sortedExercises, supersetInfo } from '../../domain/superset';
import { findPreviousPerformance } from '../../domain/previous';
import { setLabels, pickValues } from '../../domain/sets';
import { formatNumber } from '../../domain/units';
import { toDisplayWeight } from '../../domain/units';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useRecentExerciseIds } from '../../store/selectors';
import { haptic } from '../../lib/feedback';
import { columnsFor, formatSet } from '../../lib/format';
import { ExerciseCard } from '../../components/ExerciseCard';
import { SetRow } from '../../components/SetRow';
import { SetTypeLetter } from '../../components/SetTypeBadge';
import { SupersetBracket } from '../../components/SupersetBracket';
import { ExercisePicker } from '../../components/ExercisePicker';
import { PlateCalculator } from '../../components/PlateCalculator';
import { ReorderList } from '../../components/ReorderList';
import { Button, EmptyState, MenuList, Sheet, inputClass } from '../../components/ui';
import { useWorkoutContext } from './useExerciseContext';

type PickerMode = { kind: 'add' } | { kind: 'replace'; weId: string } | { kind: 'superset'; weId: string };

export function WorkoutEditor({ workout: w, onChange, mode, template }: { workout: Workout; onChange: (fn: (w: Workout) => Workout) => void; mode: 'active' | 'edit'; template?: Template }) {
  const navigate = useNavigate();
  const history = useAppStore((s) => s.workouts);
  const settings = useAppStore((s) => s.settings);
  const exercises = useAppStore((s) => s.exercises);
  const saveExercise = useAppStore((s) => s.saveExercise);
  const createExercise = useAppStore((s) => s.createExercise);
  const { showToast, highlightSetId, setHighlight } = useUiStore();
  const recentIds = useRecentExerciseIds();
  const { exMap, trackingOf, perExercise, prs, rows, prior } = useWorkoutContext(w, history, settings, template);

  const [setMenu, setSetMenu] = useState<{ weId: string; setId: string } | null>(null);
  const [exMenu, setExMenu] = useState<string | null>(null);
  const [picker, setPicker] = useState<PickerMode | null>(null);
  const [ssChooser, setSsChooser] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<{ weId: string; kind: 'session' | 'exercise' } | null>(null);
  const [reorder, setReorder] = useState(false);
  const [plates, setPlates] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  const sorted = useMemo(() => sortedExercises(w), [w]);
  const groups = useMemo(() => supersetInfo(w.exercises), [w.exercises]);
  const selectable = useMemo(() => exercises.filter((e) => !e.archived), [exercises]);

  useEffect(() => {
    if (!highlightSetId) return;
    document.querySelector(`[data-set-row="${highlightSetId}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [highlightSetId]);

  const previousOf = (exerciseId: string) => findPreviousPerformance(exerciseId, prior);
  const weById = (id: string | null) => (id ? w.exercises.find((e) => e.id === id) : undefined);
  const nameOf = (exerciseId: string) => exMap.get(exerciseId)?.name ?? 'Unknown exercise';

  const withUndo = (message: string, fn: (w: Workout) => Workout) => {
    const snapshot = w;
    onChange(fn);
    showToast(message, () => onChange(() => snapshot));
  };

  const toggleComplete = (weId: string, setId: string) => {
    const we = weById(weId)!;
    const set = we.sets.find((s) => s.id === setId)!;
    const t = trackingOf(we.exerciseId) ?? 'weight_reps';
    const next = toggleSetComplete(w, weId, setId, rows.get(setId)?.placeholder, t, Date.now());
    if (!next) {
      showToast('Enter the values for this set first');
      return;
    }
    onChange(() => next);
    if (set.completed) return; // un-checking
    haptic();
    if (mode !== 'active') return;
    const r = afterSetCompleted(next, weId, setId);
    setHighlight(r.nextSetId ?? null);
  };

  const onPicked = async (ids: string[]) => {
    const p = picker;
    setPicker(null);
    if (!p || !ids.length) return;
    if (p.kind === 'add') onChange((cur) => addExercises(cur, ids, previousOf));
    if (p.kind === 'replace') onChange((cur) => replaceExercise(cur, p.weId, ids[0]));
    if (p.kind === 'superset') {
      onChange((cur) => {
        const added = addExercises(cur, [ids[0]], previousOf);
        const newWe = added.exercises.find((e) => !cur.exercises.some((c) => c.id === e.id))!;
        return linkSuperset(added, p.weId, newWe.id);
      });
    }
  };

  const onCreateExercise = async (name: string) => {
    const e = await createExercise({ name, bodyPart: 'Other', equipment: 'Other', trackingType: 'weight_reps' });
    showToast(`Created “${e.name}” — edit its details in Exercises`);
    await onPicked([e.id]);
  };

  const renderCard = (weId: string) => {
    const we = weById(weId)!;
    const ex = exMap.get(we.exerciseId);
    const t = ex?.trackingType ?? 'weight_reps';
    const labels = setLabels(we.sets);
    const rec = perExercise.get(we.exerciseId)?.records;
    const g = we.supersetGroupId ? groups.get(we.supersetGroupId) : undefined;
    const e1 = rec?.bestE1RM;
    return (
      <ExerciseCard
        key={we.id}
        name={ex?.name ?? 'Unknown exercise'}
        best={rec?.bestSet ? formatSet(rec.bestSet, t, settings.unit) : undefined}
        e1rm={e1 !== undefined ? `${formatNumber(Math.round(toDisplayWeight(e1, settings.unit) * 10) / 10)} ${settings.unit}` : undefined}
        exerciseNote={ex?.notes}
        sessionNote={we.sessionNote}
        superset={g ? { letter: g.letter, colorIndex: g.colorIndex } : undefined}
        columns={columnsFor(t, settings.unit)}
        showRpe={settings.showRpe}
        onMenu={() => setExMenu(we.id)}
        onNameClick={() => navigate(`/exercises/${we.exerciseId}`)}
        onAddSet={() => onChange((cur) => addSet(cur, we.id))}
      >
        {we.sets.map((s, i) => {
          const row = rows.get(s.id);
          return (
            <SetRow
              key={s.id}
              setId={s.id}
              label={labels[i]}
              type={s.type}
              values={pickValues(s)}
              placeholder={row?.placeholder}
              previousText={formatSet(row?.previous, t, settings.unit)}
              columns={columnsFor(t, settings.unit)}
              unit={settings.unit}
              showRpe={settings.showRpe}
              completed={s.completed}
              prKinds={prs.get(s.id)?.kinds}
              highlighted={highlightSetId === s.id && !s.completed}
              weightStepKg={settings.weightIncrementKg}
              plates={ex?.equipment === 'Barbell' && t === 'weight_reps'}
              onPlates={(kg) => setPlates(kg)}
              onTypeClick={() => setSetMenu({ weId: we.id, setId: s.id })}
              onPreviousClick={() => row?.previous && onChange((cur) => updateSet(cur, we.id, s.id, { ...pickValues(row.previous!), rpe: s.rpe }))}
              onChange={(patch) => onChange((cur) => updateSet(cur, we.id, s.id, patch))}
              onToggleComplete={() => toggleComplete(we.id, s.id)}
              onDelete={() => withUndo('Set deleted', (cur) => removeSet(cur, we.id, s.id))}
            />
          );
        })}
      </ExerciseCard>
    );
  };

  const menuWe = weById(exMenu);
  const setMenuWe = weById(setMenu?.weId ?? null);
  const setMenuSet = setMenuWe?.sets.find((s) => s.id === setMenu?.setId);
  const chooserWe = weById(ssChooser);
  const noteWe = weById(noteFor?.weId ?? null);

  const chooseType = (type: SetType) => {
    if (setMenu) onChange((cur) => setSetType(cur, setMenu.weId, setMenu.setId, type));
    setSetMenu(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 px-1.5 pb-1">
        <input aria-label="Workout name" className="w-full bg-transparent rounded text-2xl font-bold tracking-[-.015em] focus:outline-none focus-visible:shadow-[0_0_0_1.5px_var(--color-text)]" value={w.name} onChange={(e) => onChange((cur) => ({ ...cur, name: e.target.value }))} />
        <textarea aria-label="Workout note" placeholder="Add a note…" rows={1} className="w-full bg-transparent rounded resize-none text-sm text-secondary focus:outline-none focus-visible:shadow-[0_0_0_1.5px_var(--color-text)]" value={w.note ?? ''} onChange={(e) => onChange((cur) => ({ ...cur, note: e.target.value || undefined }))} />
      </div>

      {sorted.length === 0 && <EmptyState title="No exercises yet" message="Add exercises from the library to start logging sets." />}

      {blocks(sorted).map((block) => {
        const g = block[0].supersetGroupId ? groups.get(block[0].supersetGroupId) : undefined;
        if (g && block.length > 1) {
          return (
            <SupersetBracket key={block[0].supersetGroupId} letter={g.letter} colorIndex={g.colorIndex}>
              {block.map((we) => renderCard(we.id))}
            </SupersetBracket>
          );
        }
        return renderCard(block[0].id);
      })}

      <button type="button" onClick={() => setPicker({ kind: 'add' })} className="mt-1 h-12 rounded-md border-[1.5px] border-accent text-accent text-base font-semibold">
        + Add Exercises
      </button>

      {/* Set-type menu */}
      <Sheet open={!!setMenuSet} title={`Set ${setMenuSet ? setLabels(setMenuWe!.sets)[setMenuWe!.sets.indexOf(setMenuSet)] : ''}`} onClose={() => setSetMenu(null)}>
        {setMenuSet && (
          <MenuList
            items={[
              { label: 'Warm-up', icon: <SetTypeLetter type="warmup" />, onClick: () => chooseType('warmup'), active: setMenuSet.type === 'warmup' },
              { label: 'Drop set', icon: <SetTypeLetter type="drop" />, onClick: () => chooseType('drop'), active: setMenuSet.type === 'drop' },
              { label: 'Failure', icon: <SetTypeLetter type="failure" />, onClick: () => chooseType('failure'), active: setMenuSet.type === 'failure' },
              { label: 'Normal', icon: '', onClick: () => chooseType('normal'), active: setMenuSet.type === 'normal' },
              { label: 'Superset with…', onClick: () => { setSsChooser(setMenu!.weId); setSetMenu(null); } },
              { label: 'Delete set', danger: true, onClick: () => { const m = setMenu!; setSetMenu(null); withUndo('Set deleted', (cur) => removeSet(cur, m.weId, m.setId)); } },
            ]}
          />
        )}
      </Sheet>

      {/* Exercise ⋯ menu */}
      <Sheet open={!!menuWe} title={menuWe ? nameOf(menuWe.exerciseId) : ''} onClose={() => setExMenu(null)}>
        {menuWe && (
          <MenuList
            items={[
              { label: 'Session note', hint: menuWe.sessionNote ? 'edit' : undefined, onClick: () => { setNoteDraft(menuWe.sessionNote ?? ''); setNoteFor({ weId: menuWe.id, kind: 'session' }); setExMenu(null); } },
              { label: 'Exercise note', onClick: () => { setNoteDraft(exMap.get(menuWe.exerciseId)?.notes ?? ''); setNoteFor({ weId: menuWe.id, kind: 'exercise' }); setExMenu(null); } },
              { label: 'Superset with…', onClick: () => { setSsChooser(menuWe.id); setExMenu(null); } },
              ...(menuWe.supersetGroupId ? [{ label: 'Remove from superset', onClick: () => { onChange((cur) => unlinkSuperset(cur, menuWe.id)); setExMenu(null); } }] : []),
              { label: 'Replace exercise', onClick: () => { setPicker({ kind: 'replace', weId: menuWe.id }); setExMenu(null); } },
              { label: 'Reorder exercises', onClick: () => { setReorder(true); setExMenu(null); } },
              { label: 'Remove exercise', danger: true, onClick: () => { const id = menuWe.id; setExMenu(null); withUndo(`${nameOf(menuWe.exerciseId)} removed`, (cur) => removeExercise(cur, id)); } },
            ]}
          />
        )}
      </Sheet>

      {/* Superset chooser */}
      <Sheet open={!!chooserWe} title="Superset with…" onClose={() => setSsChooser(null)}>
        {chooserWe && (
          <MenuList
            items={[
              ...sorted
                .filter((e) => e.id !== chooserWe.id && (!chooserWe.supersetGroupId || e.supersetGroupId !== chooserWe.supersetGroupId))
                .map((e) => ({
                  label: nameOf(e.exerciseId),
                  hint: e.supersetGroupId ? `Superset ${groups.get(e.supersetGroupId)?.letter ?? ''}` : undefined,
                  onClick: () => { onChange((cur) => linkSuperset(cur, chooserWe.id, e.id)); setSsChooser(null); },
                })),
              { label: '+ Add new exercise from library', onClick: () => { setPicker({ kind: 'superset', weId: chooserWe.id }); setSsChooser(null); } },
            ]}
          />
        )}
      </Sheet>

      {/* Notes */}
      <Sheet open={!!noteWe} title={noteFor?.kind === 'exercise' ? 'Exercise note' : 'Note for this session'} onClose={() => setNoteFor(null)}
        footer={<Button variant="primary" className="flex-1" onClick={() => {
          if (!noteWe || !noteFor) return;
          const text = noteDraft.trim() || undefined;
          if (noteFor.kind === 'session') onChange((cur) => updateWorkoutExercise(cur, noteWe.id, { sessionNote: text }));
          else { const ex = exMap.get(noteWe.exerciseId); if (ex) void saveExercise({ ...ex, notes: text }); }
          setNoteFor(null);
        }}>Save</Button>}>
        <textarea aria-label="Note" autoFocus rows={3} className={`${inputClass} py-2`} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} />
      </Sheet>

      {/* Reorder */}
      <Sheet open={reorder} title="Reorder exercises" onClose={() => setReorder(false)} footer={<Button variant="primary" className="flex-1" onClick={() => setReorder(false)}>Done</Button>}>
        <ReorderList
          items={blocks(sorted).map((b) => ({
            id: b[0].id,
            title: b.map((we) => nameOf(we.exerciseId)).join(' + '),
            subtitle: b.length > 1 ? `Superset ${groups.get(b[0].supersetGroupId!)?.letter}` : `${b[0].sets.length} sets`,
          }))}
          onMove={(from, to) => onChange((cur) => reorderWorkout(cur, from, to))}
        />
      </Sheet>

      <Sheet open={plates !== null} title="Plate calculator" onClose={() => setPlates(null)}>
        {plates !== null && <PlateCalculator weightKg={plates} barKg={settings.barWeightKg} unit={settings.unit} />}
      </Sheet>

      {picker && (
        <ExercisePicker
          title={picker.kind === 'add' ? 'Add Exercises' : picker.kind === 'replace' ? 'Replace Exercise' : 'Superset with…'}
          exercises={selectable}
          recentIds={recentIds}
          multiSelect={picker.kind === 'add'}
          onCancel={() => setPicker(null)}
          onDone={onPicked}
          onCreate={onCreateExercise}
        />
      )}
    </div>
  );
}
