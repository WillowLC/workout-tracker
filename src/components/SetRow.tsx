import { useRef, useState, type CSSProperties } from 'react';
import type { SetType, SetValues, Settings } from '../domain/types';
import type { PRKind } from '../domain/prs';
import { formatNumber, fromDisplayWeight, toDisplayWeight } from '../domain/units';
import { SetTypeBadge } from './SetTypeBadge';
import { PreviousCell } from './PreviousCell';
import { PRBadge } from './PRBadge';
import { ClockInput, NumberInput } from './inputs';
import { IconCheck } from './icons';

export type SetColumn = { key: 'weight' | 'reps' | 'durationSec' | 'distanceM'; label: string };

export function setGridStyle(columns: number, showRpe: boolean): CSSProperties {
  return { gridTemplateColumns: `36px minmax(0,1fr) repeat(${columns}, ${columns > 1 ? 64 : 80}px)${showRpe ? ' 48px' : ''} 40px` };
}

export function SetTableHeader({ columns, showRpe, previousNote }: { columns: SetColumn[]; showRpe: boolean; /** e.g. "other gym" */ previousNote?: string }) {
  return (
    <div className="grid gap-1.5 px-3 py-1 text-[11px] font-semibold tracking-[.06em] text-muted uppercase" style={setGridStyle(columns.length, showRpe)} aria-hidden>
      <span className="text-center">Set</span>
      <span className="text-center">Previous{previousNote && <span className="block normal-case tracking-normal font-medium text-[10px] leading-none text-warning">{previousNote}</span>}</span>
      {columns.map((c) => (
        <span key={c.key} className="text-center">{c.label}</span>
      ))}
      {showRpe && <span className="text-center">RPE</span>}
      <span className="flex justify-center"><IconCheck size={13} /></span>
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
  const ariaBase = `Set ${p.label}`;
  const effectiveWeight = p.values.weight ?? p.placeholder?.weight;

  const tone = p.completed ? ('plain' as const) : ('field' as const);
  const field = (c: SetColumn) => {
    const common = { 'aria-label': `${ariaBase} ${c.label}`, disabled: !p.onChange, tone };
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
        <button type="button" onClick={() => { setSwipe(0); p.onDelete?.(); }} className="absolute inset-y-0 right-0 w-24 bg-danger text-accent-contrast text-sm font-semibold rounded">
          Delete
        </button>
      )}
      <div
        className={`relative grid gap-1.5 items-center px-3 py-1 rounded tabular transition-transform ${p.completed ? 'bg-row-done' : 'bg-surface'} ${p.highlighted ? 'shadow-[inset_0_0_0_1.5px_var(--color-accent-line)]' : ''}`}
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
        <SetTypeBadge type={p.type} label={p.label} onClick={p.onTypeClick} />
        <div className="min-w-0 flex items-center justify-center gap-[5px]">
          <PreviousCell text={p.previousText} onClick={p.onPreviousClick} />
          {p.prKinds && p.prKinds.length > 0 && <PRBadge kinds={p.prKinds} compact />}
        </div>
        {p.columns.map(field)}
        {p.showRpe && (
          <NumberInput aria-label={`${ariaBase} RPE`} tone={tone} disabled={!p.onChange} value={p.values.rpe} placeholder={p.placeholder?.rpe}
            onChange={(v) => p.onChange?.({ rpe: v === undefined ? undefined : Math.min(10, Math.max(6, Math.round(v * 2) / 2)) })} />
        )}
        <button
          type="button"
          onClick={p.onToggleComplete}
          disabled={!p.onToggleComplete}
          aria-pressed={p.completed}
          aria-label={p.completed ? `${ariaBase} completed. Tap to undo` : `Complete ${ariaBase.toLowerCase()}`}
          className="h-10 w-full flex items-center justify-center"
        >
          <span
            aria-hidden
            className={`w-8 h-8 rounded flex items-center justify-center text-sm font-extrabold ${p.completed ? 'bg-accent text-accent-contrast' : 'border-[1.5px] border-border-strong text-ghost'}`}
          >
            <IconCheck size={16} />
          </span>
        </button>
      </div>
      {weightFocused && p.onChange && (
        <div className="flex items-center justify-end gap-1.5 px-3 pt-1 pb-2">
          <button type="button" onPointerDown={keepFocus} onMouseDown={keepFocus} onClick={() => step(-1)} className="h-8 px-3 rounded border border-border-control text-sm font-medium tabular">
            −{formatNumber(toDisplayWeight(p.weightStepKg ?? 2.5, p.unit))}
          </button>
          {p.plates && (
            <button type="button" onPointerDown={keepFocus} onMouseDown={keepFocus} onClick={() => p.onPlates?.(effectiveWeight ?? 0)} className="h-8 px-3 rounded border border-border-control text-sm font-medium">
              Plates
            </button>
          )}
          <button type="button" onPointerDown={keepFocus} onMouseDown={keepFocus} onClick={() => step(1)} className="h-8 px-3 rounded border border-border-control text-sm font-medium tabular">
            +{formatNumber(toDisplayWeight(p.weightStepKg ?? 2.5, p.unit))}
          </button>
        </div>
      )}
    </div>
  );
}
