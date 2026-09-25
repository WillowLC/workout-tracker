// Design reference: every key visual component in its main states, with mock data.
// Route: /dev/components
import type { ReactNode } from 'react';
import type { Muscle, SetType } from '../domain/types';
import { MUSCLES } from '../domain/types';
import { ProgressionHint } from '../components/ProgressionHint';
import { PlateauCard, PlateauIdeas, PlateauTag } from '../components/Plateau';
import { GymMenu, GymSelector } from '../components/GymSelector';
import { MuscleTrend, WeeklySetsList, type WeeklySetsRow } from '../components/WeeklySets';
import { HeatLegend, MuscleMap, RECENCY_LEGEND, VOLUME_LEGEND, type HeatLevel } from '../components/MuscleMap';
import { PRToast } from '../components/PRToast';
import { TrophyWall } from '../components/TrophyWall';
import { LifetimeLine, VolumeComparisonLine } from '../components/VolumeComparisonLine';
import { RecapCards, type RecapDisplay } from '../components/RecapCards';
import { MuscleSelect } from '../components/MuscleSelect';
import { muscleStatus } from '../domain/muscles';
import { ExerciseCard } from '../components/ExerciseCard';
import { SetRow, type SetColumn } from '../components/SetRow';
import { SetTypeBadge } from '../components/SetTypeBadge';
import { PreviousCell } from '../components/PreviousCell';
import { BestLine } from '../components/BestLine';
import { PRBadge } from '../components/PRBadge';
import { SupersetBracket } from '../components/SupersetBracket';
import { WorkoutSummary } from '../components/WorkoutSummary';
import { HistoryCard } from '../components/HistoryCard';
import { WeekdayHeader, WeekRows } from '../components/Calendar';
import { INSPIRATIONS } from '../domain/inspiration';
import { PlateCalculator } from '../components/PlateCalculator';
import { ExerciseList } from '../components/ExerciseList';
import { BackupBanner, InstallHint, ResumeBar, ToastView, UpdateBanner } from '../components/shell';
import { Button, Chip, EmptyState, Tabs } from '../components/ui';
import { SEED_EXERCISES } from '../db/seed';

const cols: SetColumn[] = [{ key: 'weight', label: 'KG' }, { key: 'reps', label: 'REPS' }];
const noop = () => {};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-bold uppercase text-muted border-b border-border pb-1">{title}</h2>
      {children}
    </section>
  );
}

const row = (label: string, type: SetType, extra: Partial<Parameters<typeof SetRow>[0]> = {}) => (
  <SetRow key={label + type} label={label} type={type} values={{}} placeholder={{ weight: 80, reps: 8 }} previousText="80 kg × 8" columns={cols} unit="kg" showRpe={false} completed={false}
    onChange={noop} onToggleComplete={noop} onTypeClick={noop} onPreviousClick={noop} {...extra} />
);

const weeklyMock: WeeklySetsRow[] = ([['chest', 14], ['quads', 12], ['lats', 9.5], ['triceps', 22], ['side_delts', 4], ['calves', 0], ['forearms', 0]] as [Muscle, number][])
  .map(([muscle, sets]) => ({ muscle, sets, target: { min: 10, max: 20 }, status: muscleStatus(sets, { min: 10, max: 20 }) }));
const volumeMock = Object.fromEntries(MUSCLES.map((m, i) => [m, (i % 5) as HeatLevel])) as Record<Muscle, HeatLevel>;
const recencyMock = Object.fromEntries(MUSCLES.map((m, i) => [m, ((i * 3) % 5) as HeatLevel])) as Record<Muscle, HeatLevel>;
const recapMock: RecapDisplay = {
  title: 'Your September in lifting',
  subtitle: 'September 2026',
  headline: [{ label: 'Workouts', value: '13', change: 8.3 }, { label: 'Time training', value: '14h 5m' }],
  totals: [{ label: 'Volume', value: '96,400 kg', change: 12 }, { label: 'Sets', value: '248', change: -4 }, { label: 'Reps', value: '2,310' }, { label: 'New PRs', value: '9' }],
  comparison: { volume: '96,400 kg', text: 'about 2 humpback whales', emoji: '🐋' },
  prCount: 9,
  biggestJump: { exercise: 'Squat (Barbell)', from: '116.7 kg', to: '124.3 kg', pct: 6.5 },
  heaviest: { exercise: 'Deadlift (Barbell)', set: '140 kg × 5' },
  favourites: [
    { label: 'Most-trained exercise', value: 'Bench Press (Barbell) · 36 sets' },
    { label: 'Most-trained muscle', value: 'Chest · 58 sets' },
    { label: 'Favourite day', value: 'Monday' },
    { label: 'Favourite time', value: 'Evening' },
    { label: 'Longest streak', value: '4 weeks in a row' },
    { label: 'Top gym', value: 'SATS Nørrebro · 11 workouts' },
  ],
  muscleLevels: volumeMock,
};
const yearMock: RecapDisplay = {
  ...recapMock,
  title: 'Your 2026 in lifting',
  subtitle: '1 Jan – 31 Dec 2026',
  year: {
    monthly: 'JFMAMJJASOND'.split('').map((label, i) => ({ label, value: 60 + ((i * 37) % 50), text: `${60 + ((i * 37) % 50)} t` })),
    topExercises: [{ name: 'Bench Press (Barbell)', sets: 412 }, { name: 'Squat (Barbell)', sets: 380 }, { name: 'Lat Pulldown (Cable)', sets: 301 }, { name: 'Deadlift (Barbell)', sets: 188 }, { name: 'Leg Press', sets: 170 }],
    prTotal: 112,
    vsYearAgo: [{ name: 'Bench Press (Barbell)', now: '106.7 kg', then: '88.3 kg', pct: 20.8 }, { name: 'Squat (Barbell)', now: '133.3 kg', then: '110 kg', pct: 21.2 }, { name: 'Deadlift (Barbell)', now: '163.3 kg' }],
    lifetime: { volume: '1.2 million kg', text: '3 Space Stations', emoji: '🛰️' },
  },
};

export function DevComponentsScreen() {
  const weeks = Array.from({ length: 3 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => ({ date: new Date(2026, 8, 7 + w * 7 + d, 12).getTime(), workouts: (w * 7 + d) % 3 === 0 ? [{ id: 'x', name: 'x', startedAt: 0, exercises: [] }] : [], future: w * 7 + d > 18 })),
  );
  return (
    <main className="p-4 flex flex-col gap-8 max-w-2xl mx-auto pb-24">
      <h1 className="text-2xl font-bold">Component gallery</h1>

      <Section title="SetTypeBadge">
        <div className="grid grid-cols-4 gap-2 w-48">
          <SetTypeBadge type="normal" label="1" /><SetTypeBadge type="warmup" label="W" /><SetTypeBadge type="drop" label="D" /><SetTypeBadge type="failure" label="F" />
        </div>
      </Section>

      <Section title="PreviousCell / BestLine / PRBadge">
        <div className="w-40"><PreviousCell text="80 kg × 8" /></div>
        <div className="w-40"><PreviousCell text="—" /></div>
        <BestLine best="100 kg × 5" e1rm="116.7 kg" />
        <BestLine />
        <div className="flex gap-2"><PRBadge kinds={['weight']} /><PRBadge kinds={['weight', 'e1rm', 'volume']} /></div>
      </Section>

      <Section title="SetRow states">
        <div className="bg-surface rounded-lg border border-border py-2 flex flex-col gap-1">
          {row('W', 'warmup', { previousText: '40 kg × 10', placeholder: { weight: 40, reps: 10 } })}
          {row('1', 'normal')}
          {row('1', 'normal', { values: { weight: 82.5, reps: 8 }, completed: true })}
          {row('2', 'normal', { values: { weight: 85, reps: 6 }, completed: true, prKinds: ['weight', 'e1rm'] })}
          {row('D', 'drop', { previousText: '60 kg × 10', placeholder: { weight: 60, reps: 10 } })}
          {row('F', 'failure')}
          {row('3', 'normal', { highlighted: true })}
          {row('4', 'normal', { previousText: '—', placeholder: undefined })}
        </div>
      </Section>

      <Section title="ExerciseCard">
        <ExerciseCard name="Bench Press (Barbell)" best="100 kg × 5" e1rm="116.7 kg" exerciseNote="Grip on the rings" columns={cols} showRpe={false} onMenu={noop} onAddSet={noop}>
          {row('1', 'normal', { values: { weight: 80, reps: 8 }, completed: true })}
          {row('2', 'normal')}
        </ExerciseCard>
        <ExerciseCard name="Pull Up (Assisted)" best="-20 kg × 8" columns={[{ key: 'weight', label: '-KG' }, { key: 'reps', label: 'REPS' }]} showRpe onMenu={noop} onAddSet={noop}>
          <SetRow label="1" type="normal" values={{}} placeholder={{ weight: 20, reps: 8 }} previousText="-20 kg × 8" columns={[{ key: 'weight', label: '-KG' }, { key: 'reps', label: 'REPS' }]} unit="kg" showRpe completed={false} onChange={noop} onToggleComplete={noop} />
        </ExerciseCard>
        <ExerciseCard name="Plank" columns={[{ key: 'durationSec', label: 'TIME' }]} showRpe={false} onAddSet={noop}>
          <SetRow label="1" type="normal" values={{ durationSec: 60 }} previousText="1:00" columns={[{ key: 'durationSec', label: 'TIME' }]} unit="kg" showRpe={false} completed onToggleComplete={noop} onChange={noop} />
        </ExerciseCard>
      </Section>

      <Section title="SupersetBracket">
        <SupersetBracket letter="A" colorIndex={0}>
          <ExerciseCard name="Bench Press (Barbell)" best="100 kg × 5" superset={{ letter: 'A', colorIndex: 0 }} columns={cols} showRpe={false} onMenu={noop} onAddSet={noop}>{row('1', 'normal')}</ExerciseCard>
          <ExerciseCard name="Bent Over Row (Barbell)" best="90 kg × 8" superset={{ letter: 'A', colorIndex: 0 }} columns={cols} showRpe={false} onMenu={noop} onAddSet={noop}>{row('1', 'normal')}</ExerciseCard>
        </SupersetBracket>
        <SupersetBracket letter="B" colorIndex={1}><p className="text-sm">…second group colour</p></SupersetBracket>
      </Section>

      <Section title="ResumeBar / Toast / Banners">
        <ResumeBar name="Push Day" elapsed="42:13" onClick={noop} />
        <ToastView message="Set deleted" onUndo={noop} onDismiss={noop} />
        <UpdateBanner duringWorkout={false} onReload={noop} />
        <UpdateBanner duringWorkout onReload={noop} />
        <BackupBanner onBackup={noop} onDismiss={noop} />
        <InstallHint ios onDismiss={noop} />
      </Section>

      <Section title="WorkoutSummary">
        <WorkoutSummary name="Push Day" date="24 Sep 2026, 18:30" duration="1h 5m" volume="8,450 kg" sets={18} count={42} inspiration={INSPIRATIONS[0]}
          comparison={<VolumeComparisonLine volume="8,450 kg" comparison="about 19 grand pianos" emoji="🎹" className="text-center" />}
          prs={[
            { exercise: 'Bench Press (Barbell)', kind: 'Best set', value: '102.5 kg × 5', was: '100 kg × 5' },
            { exercise: 'Bench Press (Barbell)', kind: 'e1RM', value: '119.6 kg', was: '116.7 kg' },
            { exercise: 'Hack Squat (Machine)', kind: 'Best set', value: '120 kg × 8' },
          ]}>
          <Button variant="primary">Done</Button>
        </WorkoutSummary>
      </Section>

      <Section title="HistoryCard / Calendar">
        <HistoryCard name="Push Day" date="Wednesday, 24 September" duration="1h 5m" volume="8,450 kg" prCount={2} gym="SATS Nørrebro"
          exercises={[{ line: '3 × Bench Press (Barbell)', best: '100 kg × 5' }, { line: '3 × Pull Up (Assisted)', best: '-20 kg × 8' }]} />
        <WeekdayHeader />
        <WeekRows weeks={weeks} now={new Date(2026, 8, 25, 12).getTime()} />
      </Section>

      <Section title="ProgressionHint (up / hold / down)">
        <div className="flex flex-col gap-2">
          <ProgressionHint kind="increase" text="Try 82.5 kg × 8" onApply={noop} />
          <ProgressionHint kind="hold" text="Stay at 80 kg, aim for 11+ reps" onApply={noop} />
          <ProgressionHint kind="decrease" text="Consider 75 kg" onApply={noop} />
        </div>
      </Section>

      <Section title="ExerciseCard with hint, plateau and “other gym”">
        <ExerciseCard name="Overhead Press (Barbell)" best="52.5 kg × 5" e1rm="61.3 kg" columns={cols} showRpe={false} onMenu={noop} onAddSet={noop}
          hint={{ kind: 'hold', text: 'Stay at 50 kg, aim for 7+ reps', onApply: noop }} plateauWeeks={8} onPlateau={noop} previousNote="other gym">
          {row('1', 'normal')}
        </ExerciseCard>
      </Section>

      <Section title="Plateau tag / sheet / dashboard card">
        <PlateauTag weeks={6} onClick={noop} />
        <div className="bg-surface border border-border rounded-lg p-4"><PlateauIdeas exercise="Overhead Press (Barbell)" weeks={8} onSnooze={noop} /></div>
        <PlateauCard items={[{ exerciseId: 'a', name: 'Overhead Press (Barbell)', weeks: 8 }, { exerciseId: 'b', name: 'Lat Pulldown (Cable)', weeks: 6 }]} onOpen={noop} />
      </Section>

      <Section title="GymSelector">
        <div className="flex gap-4"><GymSelector name="SATS Nørrebro" onClick={noop} /><GymSelector onClick={noop} /></div>
        <div className="bg-surface border border-border rounded-lg px-4">
          <GymMenu gyms={[{ id: 'a', name: 'SATS Nørrebro' }, { id: 'b', name: 'Hotel gym' }]} currentId="a" onPick={noop} onAdd={noop} onManage={noop} />
        </div>
      </Section>

      <Section title="Weekly sets list / 12-week trend">
        <div className="bg-surface border border-border rounded-lg px-3 py-2"><WeeklySetsList rows={weeklyMock} /></div>
        <div className="bg-surface border border-border rounded-lg px-3 py-2">
          <MuscleTrend target={{ min: 10, max: 20 }} weeks={[8, 10, 12, 0, 14, 16, 12, 11, 18, 22, 15, 12].map((sets, i) => ({ label: `${i + 1}/7`, sets }))} />
        </div>
      </Section>

      <Section title="MuscleMap — volume (front + back)">
        <MuscleMap levels={volumeMock} selected="chest" onSelect={noop} />
        <HeatLegend labels={VOLUME_LEGEND} />
      </Section>
      <Section title="MuscleMap — recency">
        <MuscleMap levels={recencyMock} onSelect={noop} />
        <HeatLegend labels={RECENCY_LEGEND} />
      </Section>
      <Section title="MuscleMap — small (workout detail)">
        <MuscleMap levels={volumeMock} height={150} />
      </Section>

      <Section title="MuscleSelect (exercise form)">
        <MuscleSelect primary={['chest']} secondary={['front_delts', 'triceps']} onChange={noop} />
      </Section>

      <Section title="PR toast">
        <PRToast exercise="Bench Press (Barbell)" lines={['100 kg × 5 (was 97.5 kg × 5)']} onDismiss={noop} />
        <PRToast exercise="Bench Press (Barbell)" lines={['102.5 kg × 5 (was 100 kg × 5)', 'e1RM 119.6 kg (was 116.7 kg)', 'Volume 2,460 kg (was 2,400 kg)']} onDismiss={noop} />
      </Section>

      <Section title="Trophy wall">
        <TrophyWall headline="47 PRs this year" groups={[
          { month: 'September 2026', items: [
            { id: '1', exercise: 'Bench Press (Barbell)', kind: 'Best set', value: '100 kg × 5', was: '97.5 kg × 5', date: 'Wed 24 Sep', onOpen: noop },
            { id: '2', exercise: 'Bench Press (Barbell)', kind: 'e1RM', value: '116.7 kg', was: '113.8 kg', date: 'Wed 24 Sep', onOpen: noop },
          ] },
          { month: 'August 2026', items: [{ id: '3', exercise: 'Hack Squat (Machine)', kind: 'Best set', value: '120 kg × 8', date: 'Mon 4 Aug', onOpen: noop }] },
        ]} />
      </Section>

      <Section title="Volume comparison / lifetime">
        <VolumeComparisonLine volume="8,450 kg" comparison="about 7 grand pianos" emoji="🎹" />
        <VolumeComparisonLine volume="310 kg" comparison="about a grizzly bear" emoji="🐻" />
        <LifetimeLine volume="1.2 million kg" comparison="3 Space Stations" emoji="🛰️" />
      </Section>

      <Section title="Monthly recap cards">
        <RecapCards display={recapMock} onShare={noop} />
      </Section>
      <Section title="Yearly recap cards">
        <RecapCards display={yearMock} onShare={noop} />
      </Section>

      <Section title="PlateCalculator">
        <PlateCalculator weightKg={102.5} barKg={20} unit="kg" />
      </Section>

      <Section title="Misc primitives">
        <div className="flex gap-2 flex-wrap"><Button variant="primary">Primary</Button><Button>Secondary</Button><Button variant="ghost">Ghost</Button><Button variant="danger">Danger</Button></div>
        <div className="flex gap-2"><Chip selected>Chest</Chip><Chip>Back</Chip></div>
        <Tabs value="a" onChange={noop} options={[{ value: 'a', label: 'History' }, { value: 'b', label: 'Records' }, { value: 'c', label: 'Charts' }]} />
      </Section>

      <Section title="Empty states">
        <EmptyState title="No workouts yet" message="Finished workouts show up here." action={<Button variant="primary">Start a workout</Button>} />
        <EmptyState title="No exercises yet" message="Add exercises from the library to start logging sets." />
      </Section>

      <Section title="ExerciseList (library)">
        <div className="h-96 overflow-y-auto border border-border rounded-lg">
          <ExerciseList exercises={SEED_EXERCISES.slice(0, 30)} recentIds={[SEED_EXERCISES[0].id]} onPick={noop} />
        </div>
      </Section>
    </main>
  );
}
