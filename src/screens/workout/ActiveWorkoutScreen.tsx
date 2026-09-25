import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { usePwaStore } from '../../store/pwaStore';
import { finalizeWorkout, pendingSetsWithValues } from '../../domain/workoutOps';
import { workoutVolume } from '../../domain/records';
import { pickComparison } from '../../domain/volumeComparison';
import { GymMenu } from '../../components/GymSelector';
import { AddGymSheet } from '../GymsScreen';
import { workoutMatchesTemplate } from '../../domain/templates';
import { formatClock } from '../../domain/units';
import { useNow } from '../../lib/useNow';
import { ConfirmDialog, Sheet } from '../../components/ui';
import { WorkoutEditor } from './WorkoutEditor';
import { useWorkoutContext } from './useExerciseContext';
import { IconChevronDown, IconPin } from '../../components/icons';

export function ActiveWorkoutScreen() {
  const navigate = useNavigate();
  const active = useAppStore((s) => s.active);
  const history = useAppStore((s) => s.workouts);
  const settings = useAppStore((s) => s.settings);
  const templates = useAppStore((s) => s.templates);
  const updateActive = useAppStore((s) => s.updateActive);
  const finishActive = useAppStore((s) => s.finishActive);
  const cancelActive = useAppStore((s) => s.cancelActive);
  const nextInspiration = useAppStore((s) => s.nextInspiration);
  const gyms = useAppStore((s) => s.gyms);
  const recentComparisons = useAppStore((s) => s.meta.recentComparisons);
  const noteComparison = useAppStore((s) => s.noteComparison);
  const [gymSheet, setGymSheet] = useState<'pick' | 'add' | null>(null);
  const { setSummary, setHighlight } = useUiStore();
  const now = useNow(1000);
  const [dialog, setDialog] = useState<'pending' | 'empty' | 'cancel' | null>(null);

  const template = useMemo(() => templates.find((t) => t.id === active?.templateId), [templates, active?.templateId]);
  // Hooks must run unconditionally; use an inert placeholder when there's no workout.
  const ctx = useWorkoutContext(active ?? { id: '', name: '', startedAt: 0, exercises: [] }, history, settings, template);

  if (!active) return <Navigate to="/" replace />;
  const gymName = gyms.find((g) => g.id === active.gymId)?.name;

  const complete = async (mode: 'complete' | 'discard') => {
    setDialog(null);
    const finalized = finalizeWorkout(active, mode, ctx.trackingOf, (_we, setId) => ctx.rows.get(setId)?.placeholder, Date.now());
    if (finalized.exercises.length === 0) {
      setDialog('empty');
      return;
    }
    // Pick the silly volume comparison once and store it, so it never changes when re-opened.
    const pick = pickComparison(workoutVolume(finalized, ctx.trackingOf, settings.countWarmupsInStats), recentComparisons);
    const finished = pick ? { ...finalized, volumeComparisonId: pick.item.id } : finalized;
    if (pick) void noteComparison(pick.item.id);
    const templateChanged = !!template && !workoutMatchesTemplate(finished, template);
    setHighlight(null);
    await finishActive(finished);
    setSummary({ workout: finished, templateChanged, inspiration: nextInspiration() });
    navigate('/workout/summary', { replace: true });
  };

  const onFinish = () => {
    if (pendingSetsWithValues(active, ctx.trackingOf) > 0) setDialog('pending');
    else void complete('discard');
  };

  const onCancel = async () => {
    setDialog(null);
    setHighlight(null);
    await cancelActive();
    const pwa = usePwaStore.getState();
    if (pwa.needRefresh) pwa.applyUpdate();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-full bg-bg pb-40">
      <header className="sticky top-0 z-20 bg-bg pt-safe">
        <div className="flex items-center gap-2 px-3 h-[52px] max-w-2xl mx-auto">
          <button type="button" aria-label="Minimise workout" onClick={() => navigate('/')} className="w-11 h-11 flex items-center justify-center text-muted"><IconChevronDown size={22} /></button>
          <div className="flex-1 flex flex-col items-center min-w-0">
            <p className="tabular text-[17px] font-semibold text-accent leading-tight" aria-label="Elapsed time">{formatClock((now - active.startedAt) / 1000)}</p>
            <button type="button" onClick={() => setGymSheet('pick')} className="text-[11px] text-muted inline-flex items-center gap-0.5 max-w-full" aria-label={`Gym for this workout: ${gymName ?? 'none'}. Change`}>
              <IconPin size={11} /><span className="truncate">{gymName ?? 'No gym'}</span>
            </button>
          </div>
          <button type="button" onClick={onFinish} className="h-[34px] px-4 rounded bg-accent text-accent-contrast text-[15px] font-semibold">Finish</button>
        </div>
      </header>
      <main className="px-3 pt-3 max-w-2xl mx-auto">
        <WorkoutEditor workout={active} onChange={updateActive} mode="active" template={template} />
        <button type="button" className="w-full h-11 mt-3 text-[15px] font-medium text-danger" onClick={() => setDialog('cancel')}>Cancel Workout</button>
      </main>

      <Sheet open={gymSheet === 'pick'} title="Gym for this workout" onClose={() => setGymSheet(null)}>
        <GymMenu gyms={gyms} currentId={active.gymId} allowNone
          onPick={(id) => { updateActive((w) => ({ ...w, gymId: id })); setGymSheet(null); }}
          onAdd={() => setGymSheet('add')} />
        <p className="text-xs text-muted mt-2">PREVIOUS uses your last session at this gym. Changing it here only affects this workout.</p>
      </Sheet>
      <AddGymSheet open={gymSheet === 'add'} onClose={() => setGymSheet(null)} onAdded={(g) => updateActive((w) => ({ ...w, gymId: g.id }))} />

      <ConfirmDialog
        open={dialog === 'pending'}
        title="Unfinished sets"
        message="Some sets have values but aren't checked off."
        onClose={() => setDialog(null)}
        actions={[
          { label: 'Complete them', variant: 'primary', onClick: () => void complete('complete') },
          { label: 'Discard them', onClick: () => void complete('discard') },
        ]}
      />
      <ConfirmDialog
        open={dialog === 'empty'}
        title="No completed sets"
        message="Check off at least one set to save this workout, or cancel it."
        onClose={() => setDialog(null)}
        actions={[{ label: 'Discard workout', variant: 'danger', onClick: () => void onCancel() }]}
      />
      <ConfirmDialog
        open={dialog === 'cancel'}
        title="Cancel workout?"
        message="All sets logged in this workout will be lost."
        onClose={() => setDialog(null)}
        actions={[{ label: 'Cancel workout', variant: 'danger', onClick: () => void onCancel() }]}
      />
    </div>
  );
}
