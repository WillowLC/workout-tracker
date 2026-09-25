import { useState } from 'react';
import type { Muscle, RepRange } from '../domain/types';
import type { MuscleStatus } from '../domain/muscles';
import { MUSCLE_LABELS } from '../domain/muscles';
import { IconChevronDown, IconChevronRight } from './icons';

export interface WeeklySetsRow {
  muscle: Muscle;
  sets: number;
  target: RepRange;
  status: MuscleStatus;
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const STATUS_TEXT: Record<MuscleStatus, string> = { none: 'not trained', under: 'under target', in: 'in range', over: 'over target' };
const BAR: Record<MuscleStatus, string> = { none: 'var(--heat-0)', under: 'var(--heat-2)', in: 'var(--heat-3)', over: 'var(--heat-4)' };

/** One muscle: "Chest 12 / 10–20" with a bar against the target range. */
export function WeeklySetsBar({ row, onClick }: { row: WeeklySetsRow; onClick?: () => void }) {
  const scale = Math.max(row.target.max * 1.25, row.sets);
  const pct = (n: number) => `${Math.min(100, (n / scale) * 100)}%`;
  const content = (
    <>
      <span className="flex items-baseline justify-between gap-2 text-sm">
        <span>{MUSCLE_LABELS[row.muscle]}</span>
        <span className="tabular text-muted text-xs">
          <b className="text-text text-sm">{fmt(row.sets)}</b> / {row.target.min}–{row.target.max}
          <span className="sr-only"> sets, {STATUS_TEXT[row.status]}</span>
        </span>
      </span>
      <span aria-hidden className="relative block h-2 rounded-full bg-surface-2 overflow-hidden">
        {/* Target band */}
        <span className="absolute inset-y-0 border-x border-border-strong opacity-70" style={{ left: pct(row.target.min), width: `calc(${pct(row.target.max)} - ${pct(row.target.min)})` }} />
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: pct(row.sets), background: BAR[row.status] }} />
      </span>
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} data-status={row.status} className="w-full text-left flex flex-col gap-1 py-1.5">{content}</button>
  ) : (
    <div data-status={row.status} className="flex flex-col gap-1 py-1.5">{content}</div>
  );
}

/** Muscles sorted by sets; untrained ones under a collapsed "Not trained yet". */
export function WeeklySetsList({ rows, onSelect, limit }: { rows: WeeklySetsRow[]; onSelect?: (m: Muscle) => void; limit?: number }) {
  const [showZero, setShowZero] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const trained = rows.filter((r) => r.sets > 0);
  const zero = rows.filter((r) => r.sets <= 0);
  const visible = limit && !showAll ? trained.slice(0, limit) : trained;
  return (
    <div className="flex flex-col">
      {trained.length === 0 && <p className="text-sm text-muted py-1">No sets logged this week yet.</p>}
      {visible.map((r) => <WeeklySetsBar key={r.muscle} row={r} onClick={onSelect && (() => onSelect(r.muscle))} />)}
      {limit && trained.length > limit && (
        <button type="button" onClick={() => setShowAll((v) => !v)} className="text-xs text-accent font-semibold min-h-[36px] text-left">
          {showAll ? 'Show fewer' : `Show all ${trained.length}`}
        </button>
      )}
      {zero.length > 0 && (
        <div className="flex flex-col">
          <button type="button" aria-expanded={showZero} onClick={() => setShowZero((v) => !v)} className="min-h-[36px] flex items-center gap-1 text-xs font-semibold text-muted">
            {showZero ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            Not trained yet ({zero.length})
          </button>
          {showZero && <p className="text-sm text-muted pb-1">{zero.map((r) => MUSCLE_LABELS[r.muscle]).join(', ')}</p>}
        </div>
      )}
    </div>
  );
}

/** 12-week trend of weekly sets for one muscle, as simple bars. */
export function MuscleTrend({ weeks, target }: { weeks: { label: string; sets: number }[]; target: RepRange }) {
  const max = Math.max(target.max * 1.2, ...weeks.map((w) => w.sets), 1);
  return (
    <div className="flex flex-col gap-1">
      <div className="relative h-28 flex items-end gap-1" role="img" aria-label={`Weekly sets, last ${weeks.length} weeks: ${weeks.map((w) => fmt(w.sets)).join(', ')}`}>
        <span aria-hidden className="absolute inset-x-0 border-y border-dashed border-border-strong" style={{ bottom: `${(target.min / max) * 100}%`, height: `${((target.max - target.min) / max) * 100}%` }} />
        {weeks.map((w, i) => (
          <span key={i} className="relative flex-1 rounded-t-sm" style={{ height: `${(w.sets / max) * 100}%`, background: w.sets ? 'var(--heat-3)' : 'transparent', minHeight: w.sets ? 2 : 0 }} />
        ))}
      </div>
      <div className="flex gap-1 text-[10px] text-muted tabular" aria-hidden>
        {weeks.map((w, i) => <span key={i} className="flex-1 text-center truncate">{i % 3 === 0 || i === weeks.length - 1 ? w.label : ''}</span>)}
      </div>
    </div>
  );
}
