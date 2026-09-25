// Container that edits a Workout (the active one, or a past one). Owns menus
// and sheets; renders visual components with plain props.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SetType, Template, TrackingType, Workout } from '../../domain/types';
import {
  addExercises, addSet, linkSuperset, removeExercise, removeSet, reorderWorkout, replaceExercise,
  setSetType, toggleSetComplete, unlinkSuperset, updateSet, updateWorkoutExercise,
} from '../../domain/workoutOps';
import { afterSetCompleted, blocks, sortedExercises, supersetInfo } from '../../domain/superset';
import { findPreviousPerformance } from '../../domain/previous';
import { setLabels, pickValues } from '../../domain/sets';
import { formatNumber, fromDisplayWeight } from '../../domain/units';
import { toDisplayWeight } from '../../domain/units';
import { detectPRs } from '../../domain/prs';
import { effectiveRepRange, exerciseRepRange, formatRepRange, type Suggestion } from '../../domain/progression';
import { effectiveStepKg } from '../../domain/weightSteps';
import { fireConfetti } from '../../lib/celebrate';
import { formatPR } from '../../lib/format';
import { PlateauIdeas } from '../../components/Plateau';
import { NumberInput } from '../../components/inputs';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useRecentExerciseIds } from '../../store/selectors';
import { haptic } from '../../lib/feedback';
import { columnsFor, formatSet, formatKg } from '../../lib/format';
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

/** Signed weight for hints: "82.5 kg", "+10 kg" (weighted), "-17.5 kg" (assisted). */
function hintWeight(kg: number, t: TrackingType, unit: 'kg' | 'lb'): string {
  const w = formatKg(kg, unit);
  return t === 'assisted_bodyweight' ? `-${w}` : t === 'weighted_bodyweight' ? `+${w}` : w;
}

export function hintText(s: Suggestion, t: TrackingType, unit: 'kg' | 'lb'): string {
  if (s.kind === 'increase') return `Try ${hintWeight(s.weightKg, t, unit)} × ${s.reps}`;
  if (s.kind === 'hold') return `Stay at ${hintWeight(s.weightKg, t, unit)}, aim for ${s.targetReps}+ reps`;
  return `Consider ${hintWeight(s.weightKg, t, unit)}`;
}

const usesWeightTracking = (t: TrackingType) => t === 'weight_reps' || t === 'weighted_bodyweight' || t === 'assisted_bodyweight';

export function WorkoutEditor({ workout: w, onChange, mode, template }: { workout: Workout; onChange: (fn: (w: Workout) => Workout) => void; mode: 'active' | 'edit'; template?: Template }) {
  const navigate = useNavigate();
  const history = useAppStore((s) => s.workouts);
  const settings = useAppStore((s) => s.settings);
  const exercises = useAppStore((s) => s.exercises);
  const saveExercise = useAppStore((s) => s.saveExercise);
  const createExercise = useAppStore((s) => s.createExercise);
  const saveTemplate = useAppStore((s) => s.saveTemplate);
  const plateauSnoozes = useAppStore((s) => s.meta.plateauSnoozes);
  const snoozePlateau = useAppStore((s) => s.snoozePlateau);
  const { showToast, highlightSetId, setHighlight, showPRToast } = useUiStore();
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
  const [plateauFor, setPlateauFor] = useState<string | null>(null);
  const [repRangeFor, setRepRangeFor] = useState<{ exerciseId: string; min?: number; max?: number } | null>(null);
  const [stepFor, setStepFor] = useState<{ exerciseId: string; value?: number } | null>(null);

  const sorted = useMemo(() => sortedExercises(w), [w]);
  const groups = useMemo(() => supersetInfo(w.exercises), [w.exercises]);
  const selectable = useMemo(() => exercises.filter((e) => !e.archived), [exercises]);

  useEffect(() => {
    if (!highlightSetId) return;
    document.querySelector(`[data-set-row="${highlightSetId}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [highlightSetId]);

  const previousOf = (exerciseId: string) => findPreviousPerformance(exerciseId, prior, { gymId: w.gymId });
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
    celebrateIfPR(next, we.exerciseId, setId, t);
  };

  /** Confetti + one toast listing every record the set broke. No vibration. */
  const celebrateIfPR = (next: Workout, exerciseId: string, setId: string, t: TrackingType) => {
    if (!settings.celebrations) return;
    const hit = detectPRs(next, prior, trackingOf, settings.countWarmupsInStats).get(setId);
    if (!hit) return;
    fireConfetti();
    const lines = hit.details.map((d) => {
      const txt = formatPR(d, t, settings.unit);
      const value = d.kind === 'weight' ? txt.value : `${txt.label} ${txt.value}`;
      return `${value} ${txt.was ? `(was ${txt.was})` : '(first ever)'}`;
    });
    showPRToast({ exercise: nameOf(exerciseId), lines });
  };

  /** Apply a suggested weight to the exercise's not-yet-completed normal and failure sets. */
  const applySuggestion = (weId: string, weightKg: number) => {
    onChange((cur) => {
      const we = cur.exercises.find((e) => e.id === weId);
      if (!we) return cur;
      return we.sets.reduce((acc, s) => (!s.completed && (s.type === 'normal' || s.type === 'failure') ? updateSet(acc, weId, s.id, { weight: weightKg }) : acc), cur);
    });
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
    const info = perExercise.get(we.exerciseId);
    const suggestion = mode === 'active' && settings.progressionHints ? info?.suggestion : null;
    // A record set in this workout clears the plateau straight away.
    const brokeRecord = [...prs.values()].some((h) => h.exerciseId === we.exerciseId && (h.kinds.includes('weight') || h.kinds.includes('e1rm')));
    const plateau = mode === 'active' && info?.plateau && !brokeRecord && (plateauSnoozes?.[we.exerciseId] ?? 0) < Date.now() ? info.plateau : null;
    const stepKg = effectiveStepKg(ex, settings);
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
        hint={suggestion ? { kind: suggestion.kind, text: hintText(suggestion, t, settings.unit), onApply: () => applySuggestion(we.id, suggestion.weightKg) } : undefined}
        plateauWeeks={plateau ? plateau.weeks : undefined}
        onPlateau={() => setPlateauFor(we.exerciseId)}
        previousNote={info?.previous?.otherGym ? 'other gym' : undefined}
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
              weightStepKg={stepKg}
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
  const menuEx = menuWe ? exMap.get(menuWe.exerciseId) : undefined;
  const templateOverrides = (exerciseId: string) => !!template?.exercises.find((te) => te.exerciseId === exerciseId)?.repRange;

  /** Saving a rep range from the workout updates the exercise default (and this template's override, if it has one). */
  const saveRepRange = async (exerciseId: string, range: { min: number; max: number } | null | undefined) => {
    const ex = exMap.get(exerciseId);
    if (!ex) return;
    await saveExercise({ ...ex, repRange: range });
    if (template && templateOverrides(exerciseId)) {
      await saveTemplate({ ...template, exercises: template.exercises.map((te) => (te.exerciseId === exerciseId ? { ...te, repRange: range ?? undefined } : te)) });
    }
  };

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
              ...(menuEx && usesWeightTracking(menuEx.trackingType) ? [
                { label: `Rep range: ${formatRepRange(effectiveRepRange(menuEx, template))}`, onClick: () => { const r = effectiveRepRange(menuEx, template); setRepRangeFor({ exerciseId: menuEx.id, min: r?.min, max: r?.max }); setExMenu(null); } },
                { label: `Weight step: ${formatKg(effectiveStepKg(menuEx, settings), settings.unit)}`, onClick: () => { setStepFor({ exerciseId: menuEx.id, value: menuEx.weightStepKg !== undefined ? toDisplayWeight(menuEx.weightStepKg, settings.unit) : undefined }); setExMenu(null); } },
              ] : []),
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

      {/* Plateau ideas */}
      <Sheet open={!!plateauFor} title="Plateau" onClose={() => setPlateauFor(null)}>
        {plateauFor && (
          <PlateauIdeas exercise={nameOf(plateauFor)} weeks={perExercise.get(plateauFor)?.plateau?.weeks ?? 6}
            onSnooze={() => { void snoozePlateau(plateauFor); setPlateauFor(null); showToast('Plateau alert hidden for 4 weeks'); }} />
        )}
      </Sheet>

      {/* Rep range (updates the exercise default) */}
      <Sheet open={!!repRangeFor} title={repRangeFor ? `Rep range · ${nameOf(repRangeFor.exerciseId)}` : ''} onClose={() => setRepRangeFor(null)}
        footer={repRangeFor && <Button variant="primary" className="flex-1" disabled={!repRangeFor.min || !repRangeFor.max || repRangeFor.min > repRangeFor.max} onClick={() => {
          const r = repRangeFor;
          setRepRangeFor(null);
          void saveRepRange(r.exerciseId, { min: r.min!, max: r.max! });
        }}>Save</Button>}>
        {repRangeFor && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-20"><NumberInput aria-label="Minimum reps" decimals={false} value={repRangeFor.min} onChange={(v) => setRepRangeFor({ ...repRangeFor, min: v })} /></div>
              <span className="text-muted">to</span>
              <div className="w-20"><NumberInput aria-label="Maximum reps" decimals={false} value={repRangeFor.max} onChange={(v) => setRepRangeFor({ ...repRangeFor, max: v })} /></div>
              <span className="text-muted text-sm">reps</span>
            </div>
            <p className="text-xs text-muted">
              Hit the top of the range on every set, then add weight. This changes the exercise’s default{templateOverrides(repRangeFor.exerciseId) ? ' and this template’s range' : ''}.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={() => { const id = repRangeFor.exerciseId; setRepRangeFor(null); void saveRepRange(id, null); }}>No rep range</Button>
              <Button size="sm" onClick={() => { const id = repRangeFor.exerciseId; setRepRangeFor(null); void saveRepRange(id, undefined); }}>
                Reset to default ({formatRepRange(exerciseRepRange(exMap.get(repRangeFor.exerciseId) && { ...exMap.get(repRangeFor.exerciseId)!, repRange: undefined }))})
              </Button>
            </div>
          </div>
        )}
      </Sheet>

      {/* Weight step override */}
      <Sheet open={!!stepFor} title={stepFor ? `Weight step · ${nameOf(stepFor.exerciseId)}` : ''} onClose={() => setStepFor(null)}
        footer={stepFor && <Button variant="primary" className="flex-1" disabled={!stepFor.value} onClick={() => {
          const ex = exMap.get(stepFor.exerciseId);
          if (ex && stepFor.value) void saveExercise({ ...ex, weightStepKg: fromDisplayWeight(stepFor.value, settings.unit) });
          setStepFor(null);
        }}>Save</Button>}>
        {stepFor && (() => {
          const ex = exMap.get(stepFor.exerciseId);
          const def = ex ? effectiveStepKg({ equipment: ex.equipment }, settings) : 2.5;
          return (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-24"><NumberInput aria-label={`Weight step (${settings.unit})`} value={stepFor.value} placeholder={toDisplayWeight(def, settings.unit)} onChange={(v) => setStepFor({ ...stepFor, value: v })} /></div>
                <span className="text-muted text-sm">{settings.unit}</span>
              </div>
              <p className="text-xs text-muted">Used by the ± buttons and progression hints. e.g. a plate-loaded leg press might use 2.5 kg.</p>
              {ex?.weightStepKg !== undefined && (
                <Button size="sm" onClick={() => { void saveExercise({ ...ex, weightStepKg: undefined }); setStepFor(null); }}>
                  Use {ex.equipment} default ({formatKg(def, settings.unit)})
                </Button>
              )}
            </div>
          );
        })()}
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
