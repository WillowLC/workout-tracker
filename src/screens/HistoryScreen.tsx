import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useExerciseMap, useTrackingOf } from '../store/selectors';
import { groupByMonth, recentWeeks, workoutsByDay } from '../domain/history';
import { detectPRs } from '../domain/prs';
import { bestSetOf, statSets, workoutVolume } from '../domain/records';
import { shouldRemindBackup } from '../domain/backup';
import { sortedExercises } from '../domain/superset';
import { formatDuration, formatVolume } from '../domain/units';
import { formatDate, formatSet } from '../lib/format';
import { exportJsonBackup } from '../lib/backupActions';
import { HistoryCard } from '../components/HistoryCard';
import { WeekdayHeader, WeekRows } from '../components/Calendar';
import { IconCalendar, IconChevronRight } from '../components/icons';
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

  const recent = recentWeeks(workoutsByDay(workouts), now);
  const recentCount = recent.flat().reduce((n, d) => n + d.workouts.length, 0);

  const remind = shouldRemindBackup({ workoutCount: workouts.length, lastBackupAt: meta.lastBackupAt, snoozedUntil: meta.backupSnoozedUntil, now });

  return (
    <div>
      <PageHeader title="History" />
      {remind && <BackupBanner onBackup={() => void exportJsonBackup()} onDismiss={() => void setMeta({ backupSnoozedUntil: now + 7 * DAY })} />}
      <main className="px-4 flex flex-col gap-4 pb-4">
        <button
          type="button"
          onClick={() => navigate('/history/calendar')}
          aria-label="Open full calendar"
          className="w-full text-left bg-surface rounded-lg border border-border p-3 flex flex-col gap-2"
        >
          <span className="flex items-center gap-2">
            <IconCalendar size={18} className="text-muted" />
            <span className="flex-1 font-semibold text-sm">Last 3 weeks</span>
            <span className="text-xs text-muted">{recentCount} workout{recentCount === 1 ? '' : 's'}</span>
            <IconChevronRight size={18} className="text-muted" />
          </span>
          <WeekdayHeader />
          <WeekRows weeks={recent} now={now} />
        </button>
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
