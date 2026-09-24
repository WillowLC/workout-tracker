import { useRef, useState, type CSSProperties } from 'react';
import type { SetType, SetValues, Settings } from '../domain/types';
import type { PRKind } from '../domain/prs';
import { formatNumber, fromDisplayWeight, toDisplayWeight } from '../domain/units';
import { SetTypeBadge } from './SetTypeBadge';
import { PreviousCell } from './PreviousCell';
import { PRBadge } from './PRBadge';
import { ClockInput, NumberInput } from './inputs';

export type SetColumn = { key: 'weight' | 'reps' | 'durationSec' | 'distanceM'; label: string };

export function setGridStyle(columns: number, showRpe: boolean): CSSProperties {
  return { gridTemplateColumns: `2.25rem minmax(0,1fr) repeat(${columns}, 4.25rem)${showRpe ? ' 3rem' : ''} 2.75rem` };
}

export function SetTableHeader({ columns, showRpe }: { columns: SetColumn[]; showRpe: boolean }) {
  return (
    <div className="grid gap-1.5 px-3 text-[11px] font-semibold text-muted uppercase" style={setGridStyle(columns.length, showRpe)} aria-hidden>
      <span className="text-center">Set</span>
      <span className="text-center">Previous</span>
      {columns.map((c) => (
        <span key={c.key} className="text-center">{c.label}</span>
      ))}
      {showRpe && <span className="text-center">RPE</span>}
      <span className="text-center">✓</span>
    </div>
  );
}

export interface SetRowProps {
  label: string;
  type: SetType;
  values: SetValues;
  placeholder?: SetValues;
  previousText: string;
  columns: SetColumn[];
  unit: Settings['unit'];
  showRpe: boolean;
  completed: boolean;
  prKinds?: PRKind[];
  highlighted?: boolean;
  weightStepKg?: number;
  /** Is a barbell exercise → offer the plate calculator. */
  plates?: boolean;
  onTypeClick?: () => void;
  onPreviousClick?: () => void;
  onChange?: (patch: SetValues) => void;
  onToggleComplete?: () => void;
  onDelete?: () => void;
  onPlates?: (weightKg: number) => void;
  setId?: string;
}

export function SetRow(p: SetRowProps) {
  const [swipe, setSwipe] = useState(0);
  const [weightFocused, setWeightFocused] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const isDrop = p.type === 'drop';
  const ariaBase = `Set ${p.label}`;
  const effectiveWeight = p.values.weight ?? p.placeholder?.weight;

  const field = (c: SetColumn) => {
    const common = { 'aria-label': `${ariaBase} ${c.label}`, disabled: !p.onChange };
    if (c.key === 'durationSec')
      return <ClockInput key={c.key} {...common} value={p.values.durationSec} placeholder={p.placeholder?.durationSec} onChange={(v) => p.onChange?.({ durationSec: v })} />;
    if (c.key === 'distanceM')
      return (
        <NumberInput key={c.key} {...common} value={p.values.distanceM !== undefined ? p.values.distanceM / 1000 : undefined}
          placeholder={p.placeholder?.distanceM !== undefined ? p.placeholder.distanceM / 1000 : undefined}
          onChange={(v) => p.onChange?.({ distanceM: v === undefined ? undefined : Math.round(v * 1000) })} />
      );
    if (c.key === 'reps')
      return <NumberInput key={c.key} {...common} decimals={false} value={p.values.reps} placeholder={p.placeholder?.reps} onChange={(v) => p.onChange?.({ reps: v })} />;
    return (
      <NumberInput key={c.key} {...common}
        data-set-weight={p.setId}
        value={p.values.weight !== undefined ? toDisplayWeight(p.values.weight, p.unit) : undefined}
        placeholder={p.placeholder?.weight !== undefined ? toDisplayWeight(p.placeholder.weight, p.unit) : undefined}
        onFocus={() => setWeightFocused(true)}
        onBlur={() => setWeightFocused(false)}
        onChange={(v) => p.onChange?.({ weight: v === undefined ? undefined : fromDisplayWeight(v, p.unit) })} />
    );
  };

  const keepFocus = (e: React.PointerEvent | React.MouseEvent) => e.preventDefault();
  const step = (dir: 1 | -1) => {
    const base = effectiveWeight ?? 0;
    p.onChange?.({ weight: Math.max(0, base + dir * (p.weightStepKg ?? 2.5)) });
  };

  return (
    <div className="relative" data-set-row={p.setId}>
      {p.onDelete && swipe < 0 && (
        <button type="button" onClick={() => { setSwipe(0); p.onDelete?.(); }} className="absolute inset-y-0 right-0 w-24 bg-danger text-white text-sm font-semibold rounded">
          Delete
        </button>
      )}
      <div
        className={`relative grid gap-1.5 items-center px-3 py-1 transition-transform ${p.completed ? 'bg-success-soft' : 'bg-surface'} ${p.highlighted ? 'ring-2 ring-inset ring-accent' : ''}`}
        style={{ ...setGridStyle(p.columns.length, p.showRpe), transform: swipe ? `translateX(${swipe}px)` : undefined }}
        onTouchStart={(e) => { start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
        onTouchMove={(e) => {
          if (!start.current || !p.onDelete) return;
          const dx = e.touches[0].clientX - start.current.x;
          const dy = e.touches[0].clientY - start.current.y;
          if (Math.abs(dx) > Math.abs(dy) && dx < 0) setSwipe(Math.max(dx, -96));
          else if (dx > 0 && swipe < 0) setSwipe(0);
        }}
        onTouchEnd={() => { setSwipe((s) => (s < -48 ? -96 : 0)); start.current = null; }}
      >
        <div className={isDrop ? 'pl-2 border-l-2 border-drop' : ''}>
          <SetTypeBadge type={p.type} label={p.label} onClick={p.onTypeClick} />
        </div>
        <div className="min-w-0 flex items-center justify-center gap-1">
          <PreviousCell text={p.previousText} onClick={p.onPreviousClick} />
          {p.prKinds && p.prKinds.length > 0 && <PRBadge kinds={p.prKinds} compact />}
        </div>
        {p.columns.map(field)}
        {p.showRpe && (
          <NumberInput aria-label={`${ariaBase} RPE`} disabled={!p.onChange} value={p.values.rpe} placeholder={p.placeholder?.rpe}
            onChange={(v) => p.onChange?.({ rpe: v === undefined ? undefined : Math.min(10, Math.max(6, Math.round(v * 2) / 2)) })} />
        )}
        <button
          type="button"
          onClick={p.onToggleComplete}
          disabled={!p.onToggleComplete}
          aria-pressed={p.completed}
          aria-label={p.completed ? `${ariaBase} completed. Tap to undo` : `Complete ${ariaBase.toLowerCase()}`}
          className={`min-h-[36px] rounded font-bold ${p.completed ? 'bg-success text-white' : 'bg-surface-2 text-muted'}`}
        >
          ✓
        </button>
      </div>
      {weightFocused && p.onChange && (
        <div className="flex items-center justify-end gap-2 px-3 pb-1 bg-surface">
          <button type="button" onPointerDown={keepFocus} onMouseDown={keepFocus} onClick={() => step(-1)} className="min-h-[36px] px-3 rounded bg-surface-2 text-sm tabular">
            −{formatNumber(toDisplayWeight(p.weightStepKg ?? 2.5, p.unit))}
          </button>
          {p.plates && (
            <button type="button" onPointerDown={keepFocus} onMouseDown={keepFocus} onClick={() => p.onPlates?.(effectiveWeight ?? 0)} className="min-h-[36px] px-3 rounded bg-surface-2 text-sm">
              Plates
            </button>
          )}
          <button type="button" onPointerDown={keepFocus} onMouseDown={keepFocus} onClick={() => step(1)} className="min-h-[36px] px-3 rounded bg-surface-2 text-sm tabular">
            +{formatNumber(toDisplayWeight(p.weightStepKg ?? 2.5, p.unit))}
          </button>
        </div>
      )}
    </div>
  );
}
