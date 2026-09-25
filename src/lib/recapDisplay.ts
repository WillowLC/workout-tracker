// Turn RecapData (numbers) into the pre-formatted RecapDisplay the cards render.
import type { Exercise, Settings } from '../domain/types';
import type { RecapData } from '../domain/recap';
import { recapTitle } from '../domain/recap';
import { MUSCLE_LABELS, volumeLevels } from '../domain/muscles';
import { WEEK_DAYS } from '../domain/templates';
import { comparisonPhrase, formatBigWeight, formatComparison, pickComparison, seededRng } from '../domain/volumeComparison';
import { formatDuration } from '../domain/units';
import type { RecapDisplay } from '../components/RecapCards';
import { formatDate, formatKg, formatSet } from './format';

const TIME_LABEL = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' } as const;

export function buildRecapDisplay(d: RecapData, exMap: Map<string, Exercise>, settings: Settings, now: number, lifetimeKg?: number): RecapDisplay {
  const unit = settings.unit;
  const name = (id: string) => exMap.get(id)?.name ?? 'Unknown exercise';
  const key = d.ref.kind === 'month' ? `${d.ref.year}-${d.ref.month}` : String(d.ref.year);
  const pick = pickComparison(d.volumeKg, [], seededRng(`recap-${key}`));
  const endShown = d.period.end - 1;
  const subtitle = d.ref.kind === 'month'
    ? formatDate(d.period.start, { month: 'long', year: 'numeric' })
    : `${formatDate(d.period.start, { day: 'numeric', month: 'short' })} – ${formatDate(endShown, { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const favourites: RecapDisplay['favourites'] = [];
  if (d.topExercise) favourites.push({ label: 'Most-trained exercise', value: `${name(d.topExercise.exerciseId)} · ${d.topExercise.sets} sets` });
  if (d.topMuscle) favourites.push({ label: 'Most-trained muscle', value: `${MUSCLE_LABELS[d.topMuscle.muscle]} · ${Math.round(d.topMuscle.sets * 10) / 10} sets` });
  if (d.favouriteDay !== undefined) favourites.push({ label: 'Favourite day', value: WEEK_DAYS[d.favouriteDay] });
  if (d.favouriteTime) favourites.push({ label: 'Favourite time', value: TIME_LABEL[d.favouriteTime] });
  favourites.push({ label: 'Longest streak', value: `${d.longestWeekStreak} week${d.longestWeekStreak === 1 ? '' : 's'} in a row` });
  if (d.topGym) favourites.push({ label: 'Top gym', value: `${d.topGym.name} · ${d.topGym.workouts} workouts` });

  const display: RecapDisplay = {
    title: recapTitle(d.ref, now),
    subtitle,
    headline: [
      { label: 'Workouts', value: String(d.workouts), change: d.change.workouts },
      { label: 'Time training', value: formatDuration(d.totalTimeMs) },
    ],
    totals: [
      { label: 'Volume', value: formatBigWeight(d.volumeKg, unit), change: d.change.volume },
      { label: 'Sets', value: d.sets.toLocaleString('en-US'), change: d.change.sets },
      { label: 'Reps', value: d.reps.toLocaleString('en-US') },
      { label: 'New PRs', value: String(d.prCount) },
    ],
    comparison: pick && { volume: formatBigWeight(d.volumeKg, unit), text: formatComparison(pick), emoji: pick.item.emoji },
    prCount: d.prCount,
    biggestJump: d.biggestJump && { exercise: name(d.biggestJump.exerciseId), from: formatKg(d.biggestJump.from, unit), to: formatKg(d.biggestJump.to, unit), pct: d.biggestJump.pct },
    heaviest: d.heaviestSet && { exercise: name(d.heaviestSet.exerciseId), set: formatSet(d.heaviestSet.set, 'weight_reps', unit) },
    favourites,
    muscleLevels: volumeLevels(d.muscleSets, d.weeks, settings),
  };
  if (d.ref.kind === 'year') {
    const life = lifetimeKg ? pickComparison(lifetimeKg, [], seededRng('lifetime')) : undefined;
    display.year = {
      monthly: (d.monthlyVolume ?? []).map((m) => ({ label: new Date(2000, m.month, 1).toLocaleDateString('en-US', { month: 'narrow' }), value: m.volumeKg, text: formatBigWeight(m.volumeKg, unit) })),
      topExercises: (d.topExercises ?? []).map((e) => ({ name: name(e.exerciseId), sets: e.sets })),
      prTotal: d.prCount,
      vsYearAgo: (d.vsYearAgo ?? []).filter((v) => v.now !== undefined).map((v) => ({
        name: name(v.exerciseId),
        now: formatKg(v.now!, unit),
        then: v.then !== undefined ? formatKg(v.then, unit) : undefined,
        pct: v.then ? ((v.now! - v.then) / v.then) * 100 : undefined,
      })),
      lifetime: life && lifetimeKg ? { volume: formatBigWeight(lifetimeKg, unit), text: comparisonPhrase(life), emoji: life.item.emoji } : undefined,
    };
  }
  return display;
}
