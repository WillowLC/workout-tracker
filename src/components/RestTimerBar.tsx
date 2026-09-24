import { formatClock } from '../domain/units';
import { Button } from './ui';

/** Floating rest-timer bar: countdown, −15s / +15s / skip. */
export function RestTimerBar({ remainingSec, totalSec, label, onAdjust, onSkip }: { remainingSec: number; totalSec: number; label?: string; onAdjust: (delta: number) => void; onSkip: () => void }) {
  const pct = totalSec > 0 ? Math.max(0, Math.min(1, remainingSec / totalSec)) : 0;
  return (
    <div role="timer" aria-live="off" aria-label={`Rest ${formatClock(remainingSec)}`} className="bg-accent text-accent-contrast rounded-lg overflow-hidden shadow-lg">
      <div className="h-1 relative">
        <div className="absolute inset-0 bg-accent-contrast opacity-30" />
        <div className="relative h-full bg-accent-contrast" style={{ width: `${pct * 100}%` }} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex-1">
          <p className="text-xs opacity-70">Rest{label ? ` · ${label}` : ''}</p>
          <p className="text-2xl font-bold tabular">{formatClock(remainingSec)}</p>
        </div>
        <Button size="sm" variant="ghost" className="!text-accent-contrast" onClick={() => onAdjust(-15)}>−15s</Button>
        <Button size="sm" variant="ghost" className="!text-accent-contrast" onClick={() => onAdjust(15)}>+15s</Button>
        <Button size="sm" variant="ghost" className="!text-accent-contrast font-semibold" onClick={onSkip}>Skip</Button>
      </div>
    </div>
  );
}
