import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useExerciseMap, useTrackingOf } from '../store/selectors';
import { groupByMonth, trainingHeatmap } from '../domain/history';
import { detectPRs } from '../domain/prs';
import { bestSetOf, statSets, workoutVolume } from '../domain/records';
import { shouldRemindBackup } from '../domain/backup';
import { sortedExercises } from '../domain/superset';
import { formatDuration, formatVolume } from '../domain/units';
import { formatDate, formatSet } from '../lib/format';
import { exportJsonBackup } from '../lib/backupActions';
import { HistoryCard } from '../components/HistoryCard';
import { Heatmap } from '../components/Heatmap';
import { BackupBanner } from '../components/shell';
import { Card, EmptyState, PageHeader, Button } from '../components/ui';

const DAY = 86_400_000;

export function HistoryScreen() {
  const navigate = useNavigate();
  const { workouts, settings, meta, setMeta } = useAppStore();
  const exMap = useExerciseMap();
  const trackingOf = useTrackingOf();
  const now = Date.now();

  const cards = useMemo(
    () =>
      groupByMonth(workouts).map(([month, list]) => [
        month,
        list.map((w) => ({
          w,
          props: {
            name: w.name,
            date: formatDate(w.startedAt, { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }),
            duration: formatDuration((w.finishedAt ?? w.startedAt) - w.startedAt),
            volume: formatVolume(workoutVolume(w, trackingOf, settings.countWarmupsInStats), settings.unit),
            prCount: detectPRs(w, workouts, trackingOf, settings.countWarmupsInStats).size,
            exercises: sortedExercises(w).map((we) => {
              const t = trackingOf(we.exerciseId) ?? 'weight_reps';
              const sets = statSets(we, settings.countWarmupsInStats);
              return { line: `${sets.length || we.sets.length} × ${exMap.get(we.exerciseId)?.name ?? 'Unknown'}`, best: formatSet(bestSetOf(sets, t), t, settings.unit) };
            }),
          },
        })),
      ] as const),
    [workouts, exMap, trackingOf, settings],
  );

  const remind = shouldRemindBackup({ workoutCount: workouts.length, lastBackupAt: meta.lastBackupAt, snoozedUntil: meta.backupSnoozedUntil, now });

  return (
    <div>
      <PageHeader title="History" />
      {remind && <BackupBanner onBackup={() => void exportJsonBackup()} onDismiss={() => void setMeta({ backupSnoozedUntil: now + 7 * DAY })} />}
      <main className="px-4 flex flex-col gap-4 pb-4">
        <Card className="p-3"><Heatmap weeks={trainingHeatmap(workouts, now)} /></Card>
        {workouts.length === 0 && (
          <Card>
            <EmptyState title="No workouts yet" message="Finished workouts show up here." action={<Button variant="primary" onClick={() => navigate('/')}>Start a workout</Button>} />
          </Card>
        )}
        {cards.map(([month, list]) => (
          <section key={month} className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-muted uppercase">{month}</h2>
            {list.map(({ w, props }) => <HistoryCard key={w.id} {...props} onClick={() => navigate(`/history/${w.id}`)} />)}
          </section>
        ))}
      </main>
    </div>
  );
}
