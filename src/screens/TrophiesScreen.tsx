import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BodyPart } from '../domain/types';
import { BODY_PARTS } from '../domain/types';
import { useAppStore } from '../store/appStore';
import { useExerciseMap } from '../store/selectors';
import { formatDate, formatPR } from '../lib/format';
import { TrophyWall, type TrophyItem } from '../components/TrophyWall';
import { Button, Chip, PageHeader, inputClass } from '../components/ui';
import { IconChevronLeft } from '../components/icons';

/** History → Trophies: every PR ever, newest first, grouped by month. */
export function TrophiesScreen() {
  const navigate = useNavigate();
  const { personalRecords, settings } = useAppStore();
  const exMap = useExerciseMap();
  const [exerciseId, setExerciseId] = useState('');
  const [bodyPart, setBodyPart] = useState<BodyPart | ''>('');

  const exercisesWithPRs = useMemo(
    () => [...new Set(personalRecords.map((p) => p.exerciseId))].map((id) => exMap.get(id)).filter((e) => !!e).sort((a, b) => a!.name.localeCompare(b!.name)),
    [personalRecords, exMap],
  );
  const bodyParts = BODY_PARTS.filter((b) => exercisesWithPRs.some((e) => e!.bodyPart === b));

  const filtered = personalRecords
    .filter((p) => (!exerciseId || p.exerciseId === exerciseId) && (!bodyPart || exMap.get(p.exerciseId)?.bodyPart === bodyPart))
    .sort((a, b) => b.date - a.date || a.exerciseId.localeCompare(b.exerciseId));

  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
  const thisYear = filtered.filter((p) => p.date >= yearStart).length;
  const headline = `${thisYear} PR${thisYear === 1 ? '' : 's'} this year${filtered.length !== thisYear ? ` · ${filtered.length} all time` : ''}`;

  const groups: { month: string; items: TrophyItem[] }[] = [];
  for (const p of filtered) {
    const month = formatDate(p.date, { month: 'long', year: 'numeric' });
    if (groups[groups.length - 1]?.month !== month) groups.push({ month, items: [] });
    const ex = exMap.get(p.exerciseId);
    const txt = formatPR(p, ex?.trackingType ?? 'weight_reps', settings.unit);
    groups[groups.length - 1].items.push({
      id: p.id,
      exercise: ex?.name ?? 'Unknown exercise',
      kind: txt.label,
      value: txt.value,
      was: txt.was,
      date: formatDate(p.date, { weekday: 'short', day: 'numeric', month: 'short' }),
      onOpen: () => navigate(`/history/${p.workoutId}`),
    });
  }

  return (
    <div className="pb-8">
      <PageHeader title="Trophies" left={<Button variant="ghost" aria-label="Back" onClick={() => navigate('/history')}><IconChevronLeft size={20} /></Button>} />
      <main className="px-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <select aria-label="Filter by exercise" className={inputClass} value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
            <option value="">All exercises</option>
            {exercisesWithPRs.map((e) => <option key={e!.id} value={e!.id}>{e!.name}</option>)}
          </select>
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1" role="group" aria-label="Filter by body part">
            <Chip selected={!bodyPart} onClick={() => setBodyPart('')}>All</Chip>
            {bodyParts.map((b) => <Chip key={b} selected={bodyPart === b} onClick={() => setBodyPart(b)}>{b}</Chip>)}
          </div>
        </div>
        <TrophyWall headline={headline} groups={groups} />
      </main>
    </div>
  );
}
