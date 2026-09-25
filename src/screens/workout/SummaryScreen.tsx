import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { usePwaStore } from '../../store/pwaStore';
import { useExerciseMap, useTrackingOf } from '../../store/selectors';
import { detectPRs, PR_LABELS } from '../../domain/prs';
import { completedSetCount, workoutVolume } from '../../domain/records';
import { templateFromWorkout } from '../../domain/templates';
import { INSPIRATIONS } from '../../domain/inspiration';
import { formatDuration, formatVolume } from '../../domain/units';
import { formatDateTime, formatSet } from '../../lib/format';
import { WorkoutSummary } from '../../components/WorkoutSummary';
import { Button } from '../../components/ui';

export function SummaryScreen() {
  const navigate = useNavigate();
  const summary = useUiStore((s) => s.summary);
  const setSummary = useUiStore((s) => s.setSummary);
  const { workouts, settings, templates, saveTemplate } = useAppStore();
  const exMap = useExerciseMap();
  const trackingOf = useTrackingOf();
  const [saved, setSaved] = useState<string | null>(null);

  const prs = useMemo(() => (summary ? detectPRs(summary.workout, workouts, trackingOf, settings.countWarmupsInStats) : new Map()), [summary, workouts, trackingOf, settings.countWarmupsInStats]);
  if (!summary) return <Navigate to="/" replace />;
  const w = summary.workout;
  const template = templates.find((t) => t.id === w.templateId);
  const count = workouts.filter((x) => x.startedAt <= w.startedAt).length || 1;

  const prList = [...prs.values()].map((hit) => {
    const ex = exMap.get(hit.exerciseId);
    const set = w.exercises.flatMap((e) => e.sets).find((s) => s.id === hit.setId)!;
    return { exercise: ex?.name ?? '', set: formatSet(set, ex?.trackingType ?? 'weight_reps', settings.unit), kinds: hit.kinds.map((k: keyof typeof PR_LABELS) => PR_LABELS[k]) };
  });

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
          volume={formatVolume(workoutVolume(w, trackingOf, settings.countWarmupsInStats), settings.unit)}
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
