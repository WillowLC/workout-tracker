// Design reference: every key visual component in its main states, with mock data.
// Route: /dev/components
import type { ReactNode } from 'react';
import type { SetType } from '../domain/types';
import { ExerciseCard } from '../components/ExerciseCard';
import { SetRow, type SetColumn } from '../components/SetRow';
import { SetTypeBadge } from '../components/SetTypeBadge';
import { PreviousCell } from '../components/PreviousCell';
import { BestLine } from '../components/BestLine';
import { PRBadge } from '../components/PRBadge';
import { SupersetBracket } from '../components/SupersetBracket';
import { RestTimerBar } from '../components/RestTimerBar';
import { WorkoutSummary } from '../components/WorkoutSummary';
import { HistoryCard } from '../components/HistoryCard';
import { Heatmap } from '../components/Heatmap';
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

export function DevComponentsScreen() {
  const weeks = Array.from({ length: 16 }, (_, w) => Array.from({ length: 7 }, (_, d) => ({ date: w * 7 + d, count: (w * 7 + d) % 3 === 0 ? 1 : 0 })));
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

      <Section title="RestTimerBar (running)">
        <RestTimerBar remainingSec={83} totalSec={120} label="Bench Press (Barbell)" onAdjust={noop} onSkip={noop} />
      </Section>

      <Section title="ResumeBar / Toast / Banners">
        <ResumeBar name="Push Day" elapsed="42:13" rest="1:12" onClick={noop} />
        <ToastView message="Set deleted" onUndo={noop} onDismiss={noop} />
        <UpdateBanner duringWorkout={false} onReload={noop} />
        <UpdateBanner duringWorkout onReload={noop} />
        <BackupBanner onBackup={noop} onDismiss={noop} />
        <InstallHint ios onDismiss={noop} />
      </Section>

      <Section title="WorkoutSummary">
        <WorkoutSummary name="Push Day" date="24 Sep 2026, 18:30" duration="1h 5m" volume="8,450 kg" sets={18}
          prs={[{ exercise: 'Bench Press (Barbell)', set: '102.5 kg × 5', kinds: ['Best set', 'Est. 1RM'] }]}>
          <Button variant="primary">Done</Button>
        </WorkoutSummary>
      </Section>

      <Section title="HistoryCard / Heatmap">
        <HistoryCard name="Push Day" date="Wednesday, 24 September" duration="1h 5m" volume="8,450 kg" prCount={2}
          exercises={[{ line: '3 × Bench Press (Barbell)', best: '100 kg × 5' }, { line: '3 × Pull Up (Assisted)', best: '-20 kg × 8' }]} />
        <Heatmap weeks={weeks} />
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
