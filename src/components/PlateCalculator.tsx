import { platesPerSide, PLATES_KG, PLATES_LB } from '../domain/plates';
import { formatNumber, toDisplayWeight } from '../domain/units';
import type { Settings } from '../domain/types';

/** Plates per side for a barbell weight. All inputs in kg; shown in the user's unit. */
export function PlateCalculator({ weightKg, barKg, unit }: { weightKg: number; barKg: number; unit: Settings['unit'] }) {
  const total = toDisplayWeight(weightKg, unit);
  const bar = toDisplayWeight(barKg, unit);
  const r = platesPerSide(total, bar, unit === 'lb' ? PLATES_LB : PLATES_KG);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        {formatNumber(total)} {unit} total · bar {formatNumber(bar)} {unit}
      </p>
      {total < bar ? (
        <p>Weight is less than the bar.</p>
      ) : r.perSide.length === 0 ? (
        <p>Just the bar.</p>
      ) : (
        <>
          <p className="font-semibold">Per side:</p>
          <div className="flex flex-wrap gap-2" aria-label="Plates per side">
            {r.perSide.map((pl, i) => (
              <span key={i} className="rounded border border-border bg-surface-2 px-3 py-2 font-semibold tabular">
                {formatNumber(pl)}
              </span>
            ))}
          </div>
        </>
      )}
      {r.remainder > 0.001 && <p className="text-sm text-warning">Can't make {formatNumber(r.remainder)} {unit} per side with standard plates.</p>}
    </div>
  );
}
