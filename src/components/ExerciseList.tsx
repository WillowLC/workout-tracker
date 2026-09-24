import { useMemo, useState } from 'react';
import type { BodyPart, Equipment, Exercise } from '../domain/types';
import { BODY_PARTS, EQUIPMENT } from '../domain/types';
import { alphaSections, filterExercises } from '../domain/search';
import { Chip, EmptyState } from './ui';
import { ExerciseThumb } from './ExerciseThumb';
import { exerciseMedia } from '../db/exerciseMedia';

export interface ExerciseListProps {
  exercises: Exercise[];
  recentIds?: string[];
  selectedIds?: string[];
  multiSelect?: boolean;
  onPick: (e: Exercise) => void;
  onCreate?: (name: string) => void;
  showArchivedToggle?: boolean;
}

/** Searchable, filterable, alphabetical exercise list with a "Recent" section. */
export function ExerciseList({ exercises, recentIds = [], selectedIds = [], multiSelect, onPick, onCreate, showArchivedToggle }: ExerciseListProps) {
  const [query, setQuery] = useState('');
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [filterOpen, setFilterOpen] = useState<'body' | 'equip' | null>(null);

  const filtered = useMemo(
    () => filterExercises(exercises, { query, bodyParts, equipment, includeArchived: showArchived }),
    [exercises, query, bodyParts, equipment, showArchived],
  );
  const hasFilters = !!query.trim() || bodyParts.length > 0 || equipment.length > 0;
  const byId = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);
  const recent = hasFilters ? [] : recentIds.map((id) => byId.get(id)).filter((e): e is Exercise => !!e && !e.archived);
  const sections = hasFilters && query.trim() ? [['Results', filtered] as [string, Exercise[]]] : alphaSections(filtered);
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const row = (e: Exercise, keyPrefix = '') => {
    const selected = selectedIds.includes(e.id);
    return (
      <li key={keyPrefix + e.id}>
        <button
          type="button"
          onClick={() => onPick(e)}
          aria-pressed={multiSelect ? selected : undefined}
          className={`w-full text-left px-4 py-2 flex items-center gap-3 border-b border-divider ${selected ? 'bg-accent-tint' : ''}`}
        >
          <ExerciseThumb name={e.name} src={exerciseMedia(e.id)?.thumb} />
          <span className="flex-1 min-w-0 flex flex-col gap-[3px]">
            <span className="block truncate text-base font-semibold">{e.name}{e.archived ? ' (archived)' : ''}</span>
            <span className="block text-[13px] text-muted">{e.bodyPart} · {e.equipment}{e.isCustom ? ' · Custom' : ''}</span>
          </span>
          {multiSelect && (
            <span aria-hidden className={`w-[26px] h-[26px] flex-none rounded-full flex items-center justify-center text-[13px] font-black ${selected ? 'bg-accent text-accent-contrast' : 'border-[1.5px] border-border-control'}`}>
              {selected ? '✓' : ''}
            </span>
          )}
        </button>
      </li>
    );
  };

  const sectionHeader = (label: string) => (
    <h3 className="px-4 py-1.5 bg-section text-[11px] font-extrabold uppercase tracking-[.08em] text-muted">{label}</h3>
  );

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-1 pb-3 flex flex-col gap-2.5 sticky top-0 bg-bg z-10">
        <div className="relative">
          <span aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[13px] h-[13px] rounded-full border-2 border-ghost" />
          <input type="search" aria-label="Search exercises" placeholder="Search exercises" value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-[37px] pr-3.5 rounded-[12px] bg-surface border border-border text-base focus:outline-none focus:border-accent-line" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <Chip selected={bodyParts.length > 0 || filterOpen === 'body'} onClick={() => setFilterOpen(filterOpen === 'body' ? null : 'body')}>
            Body part{bodyParts.length ? ` (${bodyParts.length})` : ''} ▾
          </Chip>
          <Chip selected={equipment.length > 0 || filterOpen === 'equip'} onClick={() => setFilterOpen(filterOpen === 'equip' ? null : 'equip')}>
            Equipment{equipment.length ? ` (${equipment.length})` : ''} ▾
          </Chip>
          {(bodyParts.length > 0 || equipment.length > 0) && <Chip onClick={() => { setBodyParts([]); setEquipment([]); }}>Clear</Chip>}
          {showArchivedToggle && <Chip selected={showArchived} onClick={() => setShowArchived(!showArchived)}>Archived</Chip>}
        </div>
        {filterOpen === 'body' && (
          <div className="flex flex-wrap gap-2">
            {BODY_PARTS.map((b) => <Chip key={b} selected={bodyParts.includes(b)} onClick={() => setBodyParts(toggle(bodyParts, b))}>{b}</Chip>)}
          </div>
        )}
        {filterOpen === 'equip' && (
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((b) => <Chip key={b} selected={equipment.includes(b)} onClick={() => setEquipment(toggle(equipment, b))}>{b}</Chip>)}
          </div>
        )}
      </div>
      {recent.length > 0 && (
        <section>
          {sectionHeader('Recently used')}
          <ul>{recent.map((e) => row(e, 'r-'))}</ul>
        </section>
      )}
      {sections.map(([letter, list]) => (
        <section key={letter}>
          {sectionHeader(letter)}
          <ul>{list.map((e) => row(e))}</ul>
        </section>
      ))}
      {filtered.length === 0 && (
        <EmptyState
          title="No exercises found"
          message={onCreate ? 'Try a different search, or create it as a custom exercise.' : 'Try a different search or clear the filters.'}
          action={onCreate && query.trim() ? <button type="button" className="underline" onClick={() => onCreate(query.trim())}>Create “{query.trim()}”</button> : undefined}
        />
      )}
    </div>
  );
}
