import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Workout } from '../domain/types';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { useExerciseMap, useTrackingOf } from '../store/selectors';
import { detectPRs } from '../domain/prs';
import { completedSetCount, workoutVolume } from '../domain/records';
import { blocks, sortedExercises, supersetInfo } from '../domain/superset';
import { setLabels } from '../domain/sets';
import { templateFromWorkout } from '../domain/templates';
import { formatDuration, formatVolume } from '../domain/units';
import { formatDateTime, formatSetWithRpe } from '../lib/format';
import { muscleSets, volumeLevels } from '../domain/muscles';
import { comparisonFor, formatComparison } from '../domain/volumeComparison';
import { COMPARISON_BY_ID } from '../data/volumeComparisons';
import { MuscleMap } from '../components/MuscleMap';
import { Button, ConfirmDialog, EmptyState, PageHeader } from '../components/ui';
import { PRBadge } from '../components/PRBadge';
import { SupersetBracket } from '../components/SupersetBracket';
import { WorkoutEditor } from './workout/WorkoutEditor';
import { IconChevronLeft, IconPin } from '../components/icons';

export function WorkoutDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workouts, settings, active, startWorkout, deleteWorkout, saveWorkout, saveTemplate, gyms } = useAppStore();
  const showToast = useUiStore((s) => s.showToast);
  const exMap = useExerciseMap();
  const trackingOf = useTrackingOf();
  const w = workouts.find((x) => x.id === id);
  const [confirm, setConfirm] = useState<'delete' | 'repeat' | null>(null);

  if (!w) return <div><PageHeader title="Workout" left={<Button variant="ghost" onClick={() => navigate('/history')}><span className="inline-flex items-center gap-1"><IconChevronLeft size={18} />Back</span></Button>} /><EmptyState title="Workout not found" /></div>;

  const prs = detectPRs(w, workouts, trackingOf, settings.countWarmupsInStats);
  const groups = supersetInfo(w.exercises);
  const gym = gyms.find((g) => g.id === w.gymId);
  const volumeKg = workoutVolume(w, trackingOf, settings.countWarmupsInStats);
  const item = w.volumeComparisonId ? COMPARISON_BY_ID.get(w.volumeComparisonId) : undefined;
  const comparison = item && volumeKg > 0 ? comparisonFor(volumeKg, item) : undefined;
  // One workout counts as half a week (muscles are typically trained twice weekly), so a solid session reads "in range".
  const levels = volumeLevels(muscleSets([w], exMap, settings.countWarmupsInStats), 0.5, settings);

  const repeat = () => {
    startWorkout({ repeat: w });
    navigate('/workout');
  };

  const card = (weId: string) => {
    const we = w.exercises.find((e) => e.id === weId)!;
    const t = trackingOf(we.exerciseId) ?? 'weight_reps';
    const labels = setLabels(we.sets);
    return (
      <article key={we.id} className="bg-surface border border-border rounded-lg p-3">
        <button type="button" className="font-semibold text-left" onClick={() => navigate(`/exercises/${we.exerciseId}`)}>{exMap.get(we.exerciseId)?.name ?? 'Unknown'}</button>
        {we.sessionNote && <p className="text-xs text-muted">{we.sessionNote}</p>}
        <ol className="mt-1 flex flex-col gap-0.5">
          {we.sets.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2 text-sm tabular">
              <span className={`w-6 text-center font-semibold ${s.type === 'warmup' ? 'text-warmup' : s.type === 'drop' ? 'text-drop' : s.type === 'failure' ? 'text-failure' : 'text-muted'}`}>{labels[i]}</span>
              <span className="flex-1">{formatSetWithRpe(s, t, settings.unit)}</span>
              {prs.get(s.id) && <PRBadge kinds={prs.get(s.id)!.kinds} />}
            </li>
          ))}
        </ol>
      </article>
    );
  };

  return (
    <div className="pb-8">
      <PageHeader title={w.name} left={<Button variant="ghost" aria-label="Back" onClick={() => navigate('/history')}><IconChevronLeft size={20} /></Button>} right={<Button size="sm" onClick={() => navigate(`/history/${w.id}/edit`)}>Edit</Button>} />
      <main className="px-4 flex flex-col gap-3 max-w-2xl mx-auto">
        <p className="text-sm text-muted">
          {formatDateTime(w.startedAt)} · {formatDuration((w.finishedAt ?? w.startedAt) - w.startedAt)} · {formatVolume(workoutVolume(w, trackingOf, settings.countWarmupsInStats), settings.unit)} · {completedSetCount(w, settings.countWarmupsInStats)} sets
          {prs.size > 0 && ` · ${prs.size} PRs`}
        </p>
        {gym && <p className="text-sm text-muted inline-flex items-center gap-1"><IconPin size={14} />{gym.name}</p>}
        {comparison && <p className="text-sm">{formatComparison(comparison)[0].toUpperCase() + formatComparison(comparison).slice(1)} lifted <span aria-hidden>{comparison.item.emoji}</span> <span className="text-xs text-muted">(approx.)</span></p>}
        {w.note && <p className="text-sm">{w.note}</p>}
        <div className="bg-surface border border-border rounded-lg p-2" aria-label="Muscles worked in this workout">
          <MuscleMap levels={levels} height={150} />
        </div>
        {blocks(sortedExercises(w)).map((b) => {
          const g = b[0].supersetGroupId ? groups.get(b[0].supersetGroupId) : undefined;
          return g && b.length > 1 ? <SupersetBracket key={b[0].id} letter={g.letter} colorIndex={g.colorIndex}>{b.map((we) => card(we.id))}</SupersetBracket> : card(b[0].id);
        })}
        <div className="flex flex-col gap-2 mt-2">
          <Button variant="primary" onClick={() => (active ? setConfirm('repeat') : repeat())}>Repeat workout</Button>
          <Button onClick={async () => { const t = templateFromWorkout(w, w.name); await saveTemplate(t); showToast(`Saved as template “${t.name}”`); }}>Save as template</Button>
          <Button className="!text-danger" onClick={() => setConfirm('delete')}>Delete workout</Button>
        </div>
      </main>
      <ConfirmDialog open={confirm === 'delete'} title="Delete this workout?" message="Records will be recalculated without it." onClose={() => setConfirm(null)}
        actions={[{ label: 'Delete', variant: 'danger', onClick: async () => {
          setConfirm(null);
          const removed = await deleteWorkout(w.id);
          navigate('/history');
          if (removed) showToast('Workout deleted', () => void saveWorkout(removed));
        } }]} />
      <ConfirmDialog open={confirm === 'repeat'} title="Workout in progress" message="Finish or cancel the current workout first." onClose={() => setConfirm(null)}
        actions={[{ label: 'Go to current workout', variant: 'primary', onClick: () => navigate('/workout') }]} />
    </div>
  );
}

export function EditWorkoutScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workouts, templates, saveWorkout } = useAppStore();
  const original = workouts.find((x) => x.id === id);
  const [draft, setDraft] = useState<Workout | undefined>(() => (original ? structuredClone(original) : undefined));
  const [durationMin, setDurationMin] = useState(() => (original ? String(Math.round(((original.finishedAt ?? original.startedAt) - original.startedAt) / 60000)) : ''));
  if (!draft || !original) return <EmptyState title="Workout not found" />;
  const template = templates.find((t) => t.id === draft.templateId);

  const save = async () => {
    const mins = Math.max(1, Number(durationMin) || 1);
    // Drop sets that were never completed; keep exercises that still have sets.
    const exercises = draft.exercises.map((we) => ({ ...we, sets: we.sets.filter((s) => s.completed) })).filter((we) => we.sets.length);
    await saveWorkout({ ...draft, exercises, finishedAt: draft.startedAt + mins * 60000 });
    navigate(`/history/${draft.id}`, { replace: true });
  };

  return (
    <div className="pb-16">
      <PageHeader title="Edit Workout" left={<Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>} right={<Button variant="primary" size="sm" onClick={save}>Save</Button>} />
      <main className="px-3 max-w-2xl mx-auto flex flex-col gap-3">
        <label className="text-sm flex items-center gap-2">
          <span className="text-muted">Duration (min)</span>
          <input inputMode="numeric" className="w-20 min-h-[40px] rounded border border-border bg-surface px-2" value={durationMin} onChange={(e) => setDurationMin(e.target.value.replace(/\D/g, ''))} />
        </label>
        <p className="text-xs text-muted">Only checked-off sets are saved.</p>
        <WorkoutEditor workout={draft} onChange={(fn) => setDraft((cur) => (cur ? fn(cur) : cur))} mode="edit" template={template} />
      </main>
    </div>
  );
}
