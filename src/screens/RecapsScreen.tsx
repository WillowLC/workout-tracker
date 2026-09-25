import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { useExerciseMap, useTrackingOf } from '../store/selectors';
import { availableRecaps, computeRecap, parseRecapKey, recapKey, recapTitle } from '../domain/recap';
import { workoutVolume } from '../domain/records';
import { buildRecapDisplay } from '../lib/recapDisplay';
import { shareElementAsPng } from '../lib/share';
import { formatDate } from '../lib/format';
import { RecapCards } from '../components/RecapCards';
import { Button, Card, EmptyState, MenuList, PageHeader } from '../components/ui';
import { IconChevronLeft } from '../components/icons';

/** History → Recaps: every month and year with data. */
export function RecapsScreen() {
  const navigate = useNavigate();
  const workouts = useAppStore((s) => s.workouts);
  const { months, years } = useMemo(() => availableRecaps(workouts), [workouts]);
  const now = Date.now();
  return (
    <div className="pb-8">
      <PageHeader title="Recaps" left={<Button variant="ghost" aria-label="Back" onClick={() => navigate('/history')}><IconChevronLeft size={20} /></Button>} />
      <main className="px-4 flex flex-col gap-4">
        {!months.length && <Card><EmptyState title="No recaps yet" message="Finish a workout and your month in lifting appears here." /></Card>}
        {years.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted uppercase mb-2">Year in lifting</h2>
            <Card className="px-4"><MenuList items={years.map((r) => ({ label: recapTitle(r, now), onClick: () => navigate(`/history/recaps/${recapKey(r)}`) }))} /></Card>
          </section>
        )}
        {months.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-muted uppercase mb-2">Months</h2>
            <Card className="px-4"><MenuList items={months.map((r) => ({ label: formatDate(new Date(r.year, r.month!, 1).getTime(), { month: 'long', year: 'numeric' }), onClick: () => navigate(`/history/recaps/${recapKey(r)}`) }))} /></Card>
          </section>
        )}
      </main>
    </div>
  );
}

/** One recap as swipeable cards, with Share (PNG). */
export function RecapScreen() {
  const { key } = useParams();
  const navigate = useNavigate();
  const { workouts, personalRecords, gyms, settings } = useAppStore();
  const showToast = useUiStore((s) => s.showToast);
  const exMap = useExerciseMap();
  const trackingOf = useTrackingOf();
  const ref = key ? parseRecapKey(key) : undefined;
  const now = Date.now();
  const display = useMemo(() => {
    if (!ref) return undefined;
    const data = computeRecap(ref, { workouts, exMap, prs: personalRecords, gyms, settings }, now);
    const lifetime = ref.kind === 'year' ? workouts.reduce((a, w) => a + workoutVolume(w, trackingOf, settings.countWarmupsInStats), 0) : undefined;
    return { data, view: buildRecapDisplay(data, exMap, settings, now, lifetime) };
  }, [key, workouts, personalRecords, gyms, settings, exMap, trackingOf]);

  return (
    <div className="min-h-full bg-bg pb-10">
      <PageHeader title={display?.view.title ?? 'Recap'} left={<Button variant="ghost" aria-label="Back" onClick={() => navigate(-1)}><IconChevronLeft size={20} /></Button>} />
      <main className="px-4 max-w-2xl mx-auto">
        {!display || display.data.workouts === 0 ? (
          <EmptyState title="Nothing to recap" message="No workouts in this period." />
        ) : (
          <RecapCards display={display.view} onShare={async (card) => {
            const r = await shareElementAsPng(card, `jim-recap-${key}`);
            if (r === 'downloaded') showToast('Recap card saved as an image');
            if (r === 'failed') showToast('Couldn’t create the image');
          }} />
        )}
      </main>
    </div>
  );
}
