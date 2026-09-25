import { IconClose, IconTrophy } from './icons';

export interface PRToastData {
  exercise: string;
  /** One line per record, e.g. "100 kg × 5 (was 97.5 kg × 5)". */
  lines: string[];
}

/** "🏆 New PR · Bench Press (Barbell) · 100 kg × 5 (was 97.5 × 5)". One toast per set, listing every record it set. */
export function PRToast({ exercise, lines, onDismiss }: PRToastData & { onDismiss?: () => void }) {
  return (
    <div role="status" className="bg-surface border border-pr rounded-lg px-4 py-2 flex items-start gap-3 shadow-lg">
      <IconTrophy size={22} className="text-pr mt-0.5" />
      <div className="flex-1 min-w-0 text-sm">
        <p className="font-bold">
          New PR{lines.length > 1 ? 's' : ''} · <span className="font-semibold">{exercise}</span>
        </p>
        {lines.map((l) => <p key={l} className="text-secondary tabular">{l}</p>)}
      </div>
      {onDismiss && <button type="button" aria-label="Dismiss" className="min-h-[36px] px-1 flex items-center text-muted" onClick={onDismiss}><IconClose size={18} /></button>}
    </div>
  );
}
