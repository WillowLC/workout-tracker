import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { bestSetOf, computeRecords, hasLoadVolume, sessionsForExercise, setE1RM, setVolume, statSets } from '../domain/records';
import { setLabels } from '../domain/sets';
import { formatClock, formatDistance, formatNumber, toDisplayWeight } from '../domain/units';
import { formatDate, formatSet, formatSetWithRpe } from '../lib/format';
import { ExerciseForm } from '../components/ExerciseForm';
import { ExerciseAbout } from '../components/ExerciseAbout';
import { exerciseMedia } from '../db/exerciseMedia';
import { EXERCISE_GUIDES } from '../db/guides';
import { Button, Card, EmptyState, PageHeader, Sheet, Tabs } from '../components/ui';

type Tab = 'about' | 'history' | 'records' | 'charts';

export function ExerciseDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exercises, workouts, settings, saveExercise } = useAppStore();
  const showToast = useUiStore((s) => s.showToast);
  const ex = exercises.find((e) => e.id === id);
  const guide = id ? EXERCISE_GUIDES[id] : undefined;
  const media = id ? exerciseMedia(id) : undefined;
  const hasAbout = !!guide || !!media;
  const [tab, setTab] = useState<Tab>(hasAbout ? 'about' : 'history');
  const [editing, setEditing] = useState(false);

  const sessions = useMemo(() => (ex ? sessionsForExercise(ex.id, workouts) : []), [ex, workouts]);
  const records = useMemo(() => (ex ? computeRecords(ex.id, ex.trackingType, workouts, settings.countWarmupsInStats) : undefined), [ex, workouts, settings.countWarmupsInStats]);

  if (!ex || !records) return <div><PageHeader title="Exercise" left={<Button variant="ghost" onClick={() => navigate(-1)}>‹</Button>} /><EmptyState title="Exercise not found" /></div>;

  const t = ex.trackingType;
  const unit = settings.unit;
  const w = (kg: number | undefined) => (kg === undefined ? '—' : `${formatNumber(toDisplayWeight(kg, unit))} ${unit}`);
  const volumeText = (v: number | undefined) => {
    if (v === undefined) return '—';
    if (hasLoadVolume(t)) return w(v);
    if (t === 'duration') return formatClock(v);
    if (t === 'distance_duration') return formatDistance(v);
    return `${v} reps`;
  };

  const chartData = [...sessions].reverse().map(({ workout, we }) => {
    const sets = statSets(we, settings.countWarmupsInStats);
    const best = bestSetOf(sets, t);
    const e1 = Math.max(0, ...sets.map((s) => setE1RM(s, t) ?? 0));
    const vol = sets.reduce((a, s) => a + setVolume(s, t), 0);
    const metric =
      t === 'reps_only' ? best?.reps : t === 'duration' ? best?.durationSec : t === 'distance_duration' ? (best?.distanceM ?? 0) / 1000 : best?.weight !== undefined ? toDisplayWeight(best.weight, unit) : undefined;
    return {
      date: formatDate(workout.startedAt, { day: 'numeric', month: 'short' }),
      best: metric,
      e1rm: e1 ? Math.round(toDisplayWeight(e1, unit) * 10) / 10 : undefined,
      volume: hasLoadVolume(t) ? Math.round(toDisplayWeight(vol, unit)) : vol,
    };
  });
  const bestLabel = t === 'reps_only' ? 'Best set (reps)' : t === 'duration' ? 'Longest (s)' : t === 'distance_duration' ? 'Longest (km)' : t === 'assisted_bodyweight' ? `Assistance on best set (${unit})` : `Best set weight (${unit})`;

  return (
    <div className="pb-8">
      <PageHeader title={ex.name} left={<Button variant="ghost" onClick={() => navigate(-1)}>‹</Button>} right={<Button size="sm" onClick={() => setEditing(true)}>Edit</Button>} />
      <main className="px-4 flex flex-col gap-3 max-w-2xl mx-auto">
        <p className="text-sm text-muted">{ex.bodyPart} · {ex.equipment}{ex.isCustom ? ' · Custom' : ''}{ex.archived ? ' · Archived' : ''}</p>
        {ex.notes && <p className="text-sm">📌 {ex.notes}</p>}
        <Tabs<Tab> value={tab} onChange={setTab} options={[...(hasAbout ? [{ value: 'about' as Tab, label: 'About' }] : []), { value: 'history', label: 'History' }, { value: 'records', label: 'Records' }, { value: 'charts', label: 'Charts' }]} />

        {tab === 'about' && (
          <ExerciseAbout name={ex.name} images={media?.images} primaryMuscles={media?.primaryMuscles} secondaryMuscles={media?.secondaryMuscles} guide={guide} />
        )}

        {tab === 'history' && (sessions.length === 0 ? <EmptyState title="No history yet" message="Sessions with this exercise will appear here." /> : sessions.map(({ workout, we }) => {
          const labels = setLabels(we.sets);
          return (
            <Card key={we.id} className="p-3">
              <button type="button" className="text-left" onClick={() => navigate(`/history/${workout.id}`)}>
                <p className="font-semibold">{workout.name}</p>
                <p className="text-xs text-muted">{formatDate(workout.startedAt, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </button>
              <ol className="mt-1">
                {we.sets.map((s, i) => (
                  <li key={s.id} className="text-sm tabular flex gap-2"><span className="w-6 text-center text-muted">{labels[i]}</span>{formatSetWithRpe(s, t, unit)}</li>
                ))}
              </ol>
            </Card>
          );
        }))}

        {tab === 'records' && (
          <div className="flex flex-col gap-3">
            <Card className="p-3">
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                <dt className="text-muted">Best set</dt><dd className="text-right font-semibold tabular">{formatSet(records.bestSet, t, unit)}</dd>
                {hasLoadVolume(t) && <><dt className="text-muted">Best est. 1RM</dt><dd className="text-right font-semibold tabular">{w(records.bestE1RM)}</dd></>}
                <dt className="text-muted">Best session volume</dt><dd className="text-right font-semibold tabular">{volumeText(records.bestVolume)}</dd>
                <dt className="text-muted">Sessions</dt><dd className="text-right tabular">{records.sessionCount}</dd>
              </dl>
            </Card>
            {hasLoadVolume(t) && (
              <Card className="p-3">
                <h3 className="font-semibold mb-2 text-sm">Rep maxes</h3>
                <p className="text-xs text-muted mb-2">Heaviest weight lifted for at least that many reps.</p>
                <table className="w-full text-sm tabular">
                  <thead><tr className="text-muted text-xs"><th className="text-left">Reps</th><th className="text-right">Weight</th></tr></thead>
                  <tbody>{records.repMaxes.map((r) => <tr key={r.reps} className="border-t border-border"><td className="py-1">{r.reps}</td><td className="text-right">{w(r.weight)}</td></tr>)}</tbody>
                </table>
              </Card>
            )}
          </div>
        )}

        {tab === 'charts' && (chartData.length < 1 ? <EmptyState title="Nothing to chart yet" message="Log this exercise to see progress over time." /> : (
          <div className="flex flex-col gap-3">
            <Chart title={bestLabel} data={chartData} dataKey="best" />
            {hasLoadVolume(t) && <Chart title={`Estimated 1RM (${unit})`} data={chartData} dataKey="e1rm" />}
            <Chart title={hasLoadVolume(t) ? `Volume (${unit})` : t === 'duration' ? 'Total time (s)' : t === 'distance_duration' ? 'Total distance (m)' : 'Total reps'} data={chartData} dataKey="volume" />
          </div>
        ))}
      </main>

      <Sheet open={editing} title={ex.isCustom ? 'Edit exercise' : 'Exercise settings'} onClose={() => setEditing(false)}>
        {editing && (
          <div className="flex flex-col gap-4">
            <ExerciseForm initial={ex} seeded={!ex.isCustom} submitLabel="Save" onSubmit={async (d) => { await saveExercise({ ...ex, ...d }); setEditing(false); }} />
            {ex.isCustom && (
              <Button onClick={async () => { await saveExercise({ ...ex, archived: !ex.archived }); setEditing(false); showToast(ex.archived ? 'Exercise restored' : 'Exercise archived — history is kept'); }}>
                {ex.archived ? 'Unarchive exercise' : 'Archive exercise'}
              </Button>
            )}
            {!ex.isCustom && <p className="text-xs text-muted">Built-in exercises can't be renamed or deleted, but you can give them a note.</p>}
          </div>
        )}
      </Sheet>
    </div>
  );
}

function Chart({ title, data, dataKey }: { title: string; data: Record<string, unknown>[]; dataKey: string }) {
  return (
    <Card className="p-3">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div className="h-48" role="img" aria-label={`${title} chart`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)' }} />
            <Line isAnimationActive={false} type="monotone" dataKey={dataKey} stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
