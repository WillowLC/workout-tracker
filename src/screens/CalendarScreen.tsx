import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { monthGrid, monthsBack, workoutsByDay, type CalendarDay } from '../domain/history';
import { formatDate } from '../lib/format';
import { WeekdayHeader, WeekRows } from '../components/Calendar';
import { IconChevronLeft, IconWorkout } from '../components/icons';
import { Button, MenuList, PageHeader, Sheet } from '../components/ui';

/** Full workout calendar: every month back to the first workout, newest on top. */
export function CalendarScreen() {
  const navigate = useNavigate();
  const workouts = useAppStore((s) => s.workouts);
  const [picked, setPicked] = useState<CalendarDay | null>(null);
  const now = Date.now();

  const byDay = useMemo(() => workoutsByDay(workouts), [workouts]);
  const months = useMemo(
    () =>
      monthsBack(workouts, now).map(({ year, month }) => {
        const weeks = monthGrid(year, month, byDay, now);
        const days = weeks.flat().filter((d) => d && d.workouts.length).length;
        return { key: `${year}-${month}`, title: new Date(year, month, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }), weeks, days };
      }),
    // `now` only matters at day granularity; recompute when data changes.
    [workouts, byDay],
  );
  const total = workouts.length;

  const open = (day: CalendarDay) => {
    if (day.workouts.length === 1) navigate(`/history/${day.workouts[0].id}`);
    else setPicked(day);
  };

  return (
    <div>
      <PageHeader title="Calendar" left={<Button variant="ghost" aria-label="Back" onClick={() => navigate('/history')}><IconChevronLeft size={20} /></Button>} />
      <div className="sticky top-[calc(52px+env(safe-area-inset-top))] z-10 bg-bg px-4 pb-2">
        <p className="text-xs text-muted mb-2">{total} workout{total === 1 ? '' : 's'} logged</p>
        <WeekdayHeader />
      </div>
      <main className="px-4 pb-6 flex flex-col gap-6">
        {months.map((m) => (
          <section key={m.key} aria-label={m.title} className="flex flex-col gap-2">
            <h2 className="flex items-baseline justify-between">
              <span className="text-sm font-bold">{m.title}</span>
              <span className="text-xs text-muted">{m.days ? `${m.days} training day${m.days === 1 ? '' : 's'}` : 'No workouts'}</span>
            </h2>
            <WeekRows weeks={m.weeks} now={now} onSelect={open} />
          </section>
        ))}
      </main>
      <Sheet open={!!picked} title={picked ? formatDate(picked.date, { weekday: 'long', day: 'numeric', month: 'long' }) : undefined} onClose={() => setPicked(null)}>
        <MenuList
          items={(picked?.workouts ?? []).map((w) => ({
            label: w.name,
            hint: new Date(w.startedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
            icon: <IconWorkout size={18} />,
            onClick: () => navigate(`/history/${w.id}`),
          }))}
        />
      </Sheet>
    </div>
  );
}
