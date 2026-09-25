import type { CalendarDay } from '../domain/history';

export const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function sameDay(a: number, b: number) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

/** One calendar square: orange = trained, grey = rest, blank = future or outside the month. */
export function DayCell({ day, now, onSelect, showNumber = true }: { day: CalendarDay | null; now: number; onSelect?: (day: CalendarDay) => void; showNumber?: boolean }) {
  if (!day) return <div className="aspect-square" aria-hidden />;
  const trained = day.workouts.length > 0;
  const today = sameDay(day.date, now);
  const label = `${new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}: ${
    trained ? `${day.workouts.length} workout${day.workouts.length > 1 ? 's' : ''}` : day.future ? 'upcoming' : 'rest'
  }`;
  const cls = `relative aspect-square rounded-sm flex items-center justify-center text-[11px] font-semibold tabular ${
    trained ? 'bg-accent text-accent-contrast' : day.future ? 'border border-dashed border-border text-ghost' : 'bg-surface-2 border border-border text-muted'
  } ${today ? 'ring-2 ring-offset-1 ring-offset-surface ring-accent-line' : ''}`;
  const content = (
    <>
      {showNumber && new Date(day.date).getDate()}
      {day.workouts.length > 1 && <span aria-hidden className="absolute top-[3px] right-[3px] w-1 h-1 rounded-full bg-accent-contrast" />}
    </>
  );
  if (onSelect && trained) {
    return <button type="button" aria-label={label} title={label} onClick={() => onSelect(day)} className={cls}>{content}</button>;
  }
  return <div role="img" aria-label={label} title={label} className={cls}>{content}</div>;
}

export function WeekdayHeader({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-muted ${className}`} aria-hidden>
      {WEEKDAY_LETTERS.map((d, i) => <span key={i}>{d}</span>)}
    </div>
  );
}

/** Weeks as Mon..Sun rows of squares. */
export function WeekRows({ weeks, now, onSelect }: { weeks: (CalendarDay | null)[][]; now: number; onSelect?: (day: CalendarDay) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      {weeks.map((row, i) => (
        <div key={i} className="grid grid-cols-7 gap-1.5">
          {row.map((d, j) => <DayCell key={d?.date ?? `pad${j}`} day={d} now={now} onSelect={onSelect} />)}
        </div>
      ))}
    </div>
  );
}
