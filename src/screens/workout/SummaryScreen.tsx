import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { usePwaStore } from '../../store/pwaStore';
import { useExerciseMap, useTrackingOf } from '../../store/selectors';
import { completedSetCount, workoutVolume } from '../../domain/records';
import { comparisonFor, formatComparison } from '../../domain/volumeComparison';
import { COMPARISON_BY_ID } from '../../data/volumeComparisons';
import { VolumeComparisonLine } from '../../components/VolumeComparisonLine';
import { templateFromWorkout } from '../../domain/templates';
import { INSPIRATIONS } from '../../domain/inspiration';
import { formatDuration, formatVolume } from '../../domain/units';
import { formatDateTime, formatPR } from '../../lib/format';
import { WorkoutSummary } from '../../components/WorkoutSummary';
import { Button } from '../../components/ui';

export function SummaryScreen() {
  const navigate = useNavigate();
  const summary = useUiStore((s) => s.summary);
  const setSummary = useUiStore((s) => s.setSummary);
  const { workouts, settings, templates, saveTemplate, personalRecords } = useAppStore();
  const exMap = useExerciseMap();
  const trackingOf = useTrackingOf();
  const [saved, setSaved] = useState<string | null>(null);

  const prs = useMemo(() => (summary ? personalRecords.filter((p) => p.workoutId === summary.workout.id) : []), [summary, personalRecords]);
  if (!summary) return <Navigate to="/" replace />;
  const w = summary.workout;
  const template = templates.find((t) => t.id === w.templateId);
  const count = workouts.filter((x) => x.startedAt <= w.startedAt).length || 1;

  const kindOrder = { weight: 0, e1rm: 1, volume: 2 };
  const exOrder = new Map(w.exercises.map((we) => [we.exerciseId, we.order]));
  const prList = [...prs]
    .sort((a, b) => (exOrder.get(a.exerciseId) ?? 0) - (exOrder.get(b.exerciseId) ?? 0) || kindOrder[a.kind] - kindOrder[b.kind])
    .map((pr) => {
      const ex = exMap.get(pr.exerciseId);
      const txt = formatPR(pr, ex?.trackingType ?? 'weight_reps', settings.unit);
      return { exercise: ex?.name ?? '', kind: txt.label, value: txt.value, was: txt.was };
    });
  const volumeKg = workoutVolume(w, trackingOf, settings.countWarmupsInStats);
  const item = w.volumeComparisonId ? COMPARISON_BY_ID.get(w.volumeComparisonId) : undefined;
  const pick = item && volumeKg > 0 ? comparisonFor(volumeKg, item) : undefined;

  const done = () => {
    setSummary(null);
    navigate('/', { replace: true });
    const pwa = usePwaStore.getState();
    if (pwa.needRefresh) pwa.applyUpdate(); // deferred update, applied after the workout
  };

  return (
    <main className="min-h-full bg-bg px-4 pt-safe pb-10 max-w-2xl mx-auto">
      <div className="pt-6">
        <WorkoutSummary
          name={w.name}
          date={formatDateTime(w.startedAt)}
          duration={formatDuration((w.finishedAt ?? w.startedAt) - w.startedAt)}
          volume={formatVolume(volumeKg, settings.unit)}
          comparison={pick && <VolumeComparisonLine volume={formatVolume(volumeKg, settings.unit)} comparison={formatComparison(pick)} emoji={pick.item.emoji} className="text-center" />}
          sets={completedSetCount(w, settings.countWarmupsInStats)}
          prs={prList}
          count={count}
          inspiration={INSPIRATIONS[summary.inspiration]}
        >
          <div className="flex flex-col gap-2">
            {saved && <p role="status" className="text-sm text-success text-center">{saved}</p>}
            {template && summary.templateChanged && !saved && (
              <Button onClick={async () => { await saveTemplate(templateFromWorkout(w, template.name, template)); setSaved(`Template “${template.name}” updated`); }}>
                Update template “{template.name}”
              </Button>
            )}
            {!saved && (
              <Button onClick={async () => { const t = templateFromWorkout(w, w.name); await saveTemplate(t); setSaved(`Saved as template “${t.name}”`); }}>
                Save as new template
              </Button>
            )}
            <Button variant="primary" size="lg" onClick={done}>Done</Button>
          </div>
        </WorkoutSummary>
      </div>
    </main>
  );
}
