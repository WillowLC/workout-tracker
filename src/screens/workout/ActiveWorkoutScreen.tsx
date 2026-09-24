import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { usePwaStore } from '../../store/pwaStore';
import { finalizeWorkout, pendingSetsWithValues } from '../../domain/workoutOps';
import { workoutMatchesTemplate } from '../../domain/templates';
import { formatClock } from '../../domain/units';
import { useNow } from '../../lib/useNow';
import { ConfirmDialog } from '../../components/ui';
import { WorkoutEditor } from './WorkoutEditor';
import { useWorkoutContext } from './useExerciseContext';

export function ActiveWorkoutScreen() {
  const navigate = useNavigate();
  const active = useAppStore((s) => s.active);
  const history = useAppStore((s) => s.workouts);
  const settings = useAppStore((s) => s.settings);
  const templates = useAppStore((s) => s.templates);
  const updateActive = useAppStore((s) => s.updateActive);
  const finishActive = useAppStore((s) => s.finishActive);
  const cancelActive = useAppStore((s) => s.cancelActive);
  const { setSummary, stopRest, setHighlight } = useUiStore();
  const now = useNow(1000);
  const [dialog, setDialog] = useState<'pending' | 'empty' | 'cancel' | null>(null);

  const template = useMemo(() => templates.find((t) => t.id === active?.templateId), [templates, active?.templateId]);
  // Hooks must run unconditionally; use an inert placeholder when there's no workout.
  const ctx = useWorkoutContext(active ?? { id: '', name: '', startedAt: 0, exercises: [] }, history, settings, template);

  if (!active) return <Navigate to="/" replace />;

  const complete = async (mode: 'complete' | 'discard') => {
    setDialog(null);
    const finished = finalizeWorkout(active, mode, ctx.trackingOf, (_we, setId) => ctx.rows.get(setId)?.placeholder, Date.now());
    if (finished.exercises.length === 0) {
      setDialog('empty');
      return;
    }
    const templateChanged = !!template && !workoutMatchesTemplate(finished, template);
    stopRest();
    setHighlight(null);
    await finishActive(finished);
    setSummary({ workout: finished, templateChanged });
    navigate('/workout/summary', { replace: true });
  };

  const onFinish = () => {
    if (pendingSetsWithValues(active, ctx.trackingOf) > 0) setDialog('pending');
    else void complete('discard');
  };

  const onCancel = async () => {
    setDialog(null);
    stopRest();
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
          <button type="button" aria-label="Minimise workout" onClick={() => navigate('/')} className="w-11 h-11 flex items-center justify-center text-sm text-muted">▼</button>
          <p className="flex-1 text-center tabular text-[17px] font-semibold text-accent" aria-label="Elapsed time">{formatClock((now - active.startedAt) / 1000)}</p>
          <button type="button" onClick={onFinish} className="h-[34px] px-4 rounded bg-accent text-accent-contrast text-[15px] font-semibold">Finish</button>
        </div>
      </header>
      <main className="px-3 pt-3 max-w-2xl mx-auto">
        <WorkoutEditor workout={active} onChange={updateActive} mode="active" template={template} />
        <button type="button" className="w-full h-11 mt-3 text-[15px] font-medium text-danger" onClick={() => setDialog('cancel')}>Cancel Workout</button>
      </main>

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
