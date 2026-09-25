// History → Muscles: muscle map for a period (volume or recency) and the
// weekly sets list with week navigation and a 12-week trend per muscle.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Muscle } from '../domain/types';
import { useAppStore } from '../store/appStore';
import { useExerciseMap } from '../store/selectors';
import {
  calendarDaysBetween, exercisesForMuscle, lastTrained, monthPeriod, muscleSets, muscleTrend, MUSCLE_LABELS,
  periodWeeks, recencyLevels, targetFor, volumeLevels, weekPeriod, weeklyRows, type Period,
} from '../domain/muscles';
import { formatDate } from '../lib/format';
import { MuscleMap, HeatLegend, RECENCY_LEGEND, VOLUME_LEGEND } from '../components/MuscleMap';
import { MuscleTrend, WeeklySetsList } from '../components/WeeklySets';
import { Button, Card, Chip, MenuList, Sheet, Tabs } from '../components/ui';

type PeriodKey = 'this-week' | 'last-week' | 'last-4' | 'this-month' | `month:${number}-${number}`;

function periodFor(key: PeriodKey, now: number): Period {
  if (key === 'this-week') return weekPeriod(now);
  if (key === 'last-week') return weekPeriod(now, -1);
  if (key === 'last-4') return { start: weekPeriod(now, -3).start, end: weekPeriod(now).end };
  const d = new Date(now);
  if (key === 'this-month') return monthPeriod(d.getFullYear(), d.getMonth());
  const [y, m] = key.slice(6).split('-').map(Number);
  return monthPeriod(y, m);
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function MusclesView() {
  const navigate = useNavigate();
  const { workouts, settings } = useAppStore();
  const exMap = useExerciseMap();
  const now = Date.now();
  const cw = settings.countWarmupsInStats;
  const [mode, setMode] = useState<'volume' | 'recency'>('volume');
  const [periodKey, setPeriodKey] = useState<PeriodKey>('this-week');
  const [pickMonth, setPickMonth] = useState(false);
  const [selected, setSelected] = useState<Muscle | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [trendFor, setTrendFor] = useState<Muscle | null>(null);

  const period = periodFor(periodKey, now);
  // Weeks elapsed so far for the current week/month, so averages aren't diluted by the future.
  const effective: Period = { start: period.start, end: Math.min(period.end, Math.max(period.start + 1, now)) };
  const sets = useMemo(() => muscleSets(workouts, exMap, cw, period), [workouts, exMap, cw, period.start, period.end]);
  const asOf = Math.min(now, period.end - 1);
  const last = useMemo(() => lastTrained(workouts, exMap, asOf + 1), [workouts, exMap, asOf]);
  const levels = mode === 'volume' ? volumeLevels(sets, Math.ceil(periodWeeks(effective)), settings) : recencyLevels(last, asOf);

  const week = weekPeriod(now, weekOffset);
  const weekRows = useMemo(() => weeklyRows(muscleSets(workouts, exMap, cw, week), settings), [workouts, exMap, cw, week.start, settings]);

  const months = useMemo(() => {
    const seen = new Map<string, { y: number; m: number }>();
    for (const w of workouts) {
      const d = new Date(w.startedAt);
      seen.set(`${d.getFullYear()}-${d.getMonth()}`, { y: d.getFullYear(), m: d.getMonth() });
    }
    return [...seen.values()].sort((a, b) => b.y * 12 + b.m - (a.y * 12 + a.m));
  }, [workouts]);

  const periodLabel = periodKey.startsWith('month:') ? formatDate(period.start, { month: 'long', year: 'numeric' }) : undefined;
  const sel = selected;
  const selExercises = sel ? exercisesForMuscle(workouts, exMap, sel, cw, period) : [];
  const selDays = sel && last[sel] !== undefined ? calendarDaysBetween(last[sel]!, now) : undefined;
  const trend = trendFor ? muscleTrend(workouts, exMap, trendFor, cw, now) : [];

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-3 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1" role="group" aria-label="Period">
          <Chip selected={periodKey === 'this-week'} onClick={() => setPeriodKey('this-week')}>This week</Chip>
          <Chip selected={periodKey === 'last-week'} onClick={() => setPeriodKey('last-week')}>Last week</Chip>
          <Chip selected={periodKey === 'last-4'} onClick={() => setPeriodKey('last-4')}>Last 4 weeks</Chip>
          <Chip selected={periodKey === 'this-month'} onClick={() => setPeriodKey('this-month')}>This month</Chip>
          <Chip selected={!!periodLabel} onClick={() => setPickMonth(true)}>{periodLabel ?? 'Pick a month…'}</Chip>
        </div>
        <Tabs value={mode} onChange={setMode} options={[{ value: 'volume', label: 'Volume' }, { value: 'recency', label: 'Recency' }]} />
        <MuscleMap levels={levels} selected={sel ?? undefined} onSelect={setSelected}
          describe={(m) => (mode === 'volume' ? `${fmt(sets[m].total)} sets` : last[m] ? `${calendarDaysBetween(last[m]!, now)} days ago` : 'never')} />
        <HeatLegend labels={mode === 'volume' ? VOLUME_LEGEND : RECENCY_LEGEND} />
        <p className="text-xs text-muted text-center">
          {mode === 'volume' ? (periodWeeks(effective) > 1.5 ? 'Average sets per week vs your weekly target.' : 'Sets this period vs your weekly target.') : 'Days since each muscle was last trained.'} Tap a muscle for details.
        </p>
      </Card>

      <Card className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" aria-label="Previous week" onClick={() => setWeekOffset((o) => o - 1)}>◀</Button>
          <h3 className="flex-1 text-center text-sm font-semibold">
            {weekOffset === 0 ? 'This week' : weekOffset === -1 ? 'Last week' : `Week of ${formatDate(week.start, { day: 'numeric', month: 'short' })}`}
          </h3>
          <Button size="sm" variant="ghost" aria-label="Next week" disabled={weekOffset >= 0} onClick={() => setWeekOffset((o) => Math.min(0, o + 1))}>▶</Button>
        </div>
        <WeeklySetsList rows={weekRows} onSelect={setTrendFor} />
      </Card>

      <Sheet open={pickMonth} title="Pick a month" onClose={() => setPickMonth(false)}>
        <MenuList items={months.map(({ y, m }) => ({
          label: formatDate(new Date(y, m, 1).getTime(), { month: 'long', year: 'numeric' }),
          active: periodKey === `month:${y}-${m}`,
          onClick: () => { setPeriodKey(`month:${y}-${m}`); setPickMonth(false); },
        }))} />
      </Sheet>

      <Sheet open={!!sel} title={sel ? MUSCLE_LABELS[sel] : ''} onClose={() => setSelected(null)}>
        {sel && (
          <div className="flex flex-col gap-3">
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-surface-2 rounded p-2"><dt className="text-xs text-muted">Sets</dt><dd className="font-bold tabular">{fmt(sets[sel].total)}</dd></div>
              <div className="bg-surface-2 rounded p-2"><dt className="text-xs text-muted">Primary / secondary</dt><dd className="font-bold tabular">{sets[sel].primary} / {sets[sel].secondary}</dd></div>
              <div className="bg-surface-2 rounded p-2"><dt className="text-xs text-muted">Last trained</dt><dd className="font-bold tabular">{selDays === undefined ? 'Never' : selDays === 0 ? 'Today' : `${selDays}d ago`}</dd></div>
            </dl>
            <p className="text-xs text-muted">Weekly target {targetFor(sel, settings).min}–{targetFor(sel, settings).max} sets. Secondary sets count as ½.</p>
            <h4 className="text-sm font-semibold">Exercises that hit it</h4>
            {selExercises.length === 0 ? <p className="text-sm text-muted">None in this period.</p> : (
              <MenuList items={selExercises.map((e) => ({
                label: exMap.get(e.exerciseId)?.name ?? 'Unknown',
                hint: `${e.sets} sets · ${e.role}`,
                onClick: () => navigate(`/exercises/${e.exerciseId}`),
              }))} />
            )}
          </div>
        )}
      </Sheet>

      <Sheet open={!!trendFor} title={trendFor ? `${MUSCLE_LABELS[trendFor]} · last 12 weeks` : ''} onClose={() => setTrendFor(null)}>
        {trendFor && (
          <div className="flex flex-col gap-2">
            <MuscleTrend weeks={trend.map((t) => ({ label: formatDate(t.start, { day: 'numeric', month: 'numeric' }), sets: t.sets }))} target={targetFor(trendFor, settings)} />
            <p className="text-xs text-muted">Dashed band: weekly target {targetFor(trendFor, settings).min}–{targetFor(trendFor, settings).max} sets.</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}
