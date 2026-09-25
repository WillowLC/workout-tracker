import { PLATEAU_IDEAS } from '../domain/plateau';
import { Button, Card } from './ui';
import { IconAlert, IconChevronRight } from './icons';

/** "Plateau · 6 weeks" tag on an exercise card. */
export function PlateauTag({ weeks, onClick }: { weeks: number; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      className="self-start inline-flex items-center gap-1 rounded-full bg-surface-2 border border-border px-2 h-6 text-xs font-semibold text-warning">
      <IconAlert size={13} />
      Plateau · {weeks} weeks
    </button>
  );
}

/** Content of the plateau sheet: short ideas to break through. */
export function PlateauIdeas({ exercise, weeks, onSnooze }: { exercise: string; weeks: number; onSnooze?: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">No new best set or e1RM on <b className="text-text">{exercise}</b> for {weeks} weeks, though you’ve kept training it. A few ideas:</p>
      <ul className="flex flex-col gap-2">
        {PLATEAU_IDEAS.map((i) => (
          <li key={i.title} className="text-sm">
            <p className="font-semibold">{i.title}</p>
            <p className="text-muted">{i.text}</p>
          </li>
        ))}
      </ul>
      {onSnooze && <Button onClick={onSnooze}>Dismiss for 4 weeks</Button>}
    </div>
  );
}

/** Home dashboard card listing plateaued exercises. */
export function PlateauCard({ items, onOpen }: { items: { exerciseId: string; name: string; weeks: number }[]; onOpen: (exerciseId: string) => void }) {
  if (!items.length) return null;
  return (
    <Card className="p-3 flex flex-col gap-1">
      <h3 className="text-sm font-semibold flex items-center gap-2"><IconAlert size={16} className="text-warning" />Plateau alerts</h3>
      <ul className="flex flex-col">
        {items.map((it) => (
          <li key={it.exerciseId}>
            <button type="button" onClick={() => onOpen(it.exerciseId)} className="w-full min-h-[44px] flex items-center gap-2 text-left text-sm">
              <span className="flex-1 truncate">{it.name}</span>
              <span className="text-xs text-muted">{it.weeks} weeks</span>
              <IconChevronRight size={16} className="text-muted" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
