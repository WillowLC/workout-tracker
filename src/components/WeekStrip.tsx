import type { WeekPlan } from '../domain/types';
import { WEEK_DAYS } from '../domain/templates';

/** Seven M–S cells: filled = workout day, plain = rest; today is ringed. */
export function WeekStrip({ plan, today, nameOf }: { plan?: WeekPlan; today: number; nameOf: (id: string) => string | undefined }) {
  return (
    <span className="flex gap-1" aria-hidden>
      {WEEK_DAYS.map((d, i) => {
        const workout = plan?.[i] ? nameOf(plan[i]!) : undefined;
        return (
          <span
            key={d}
            title={`${d}: ${workout ?? 'Rest'}`}
            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${workout ? 'bg-accent text-accent-contrast' : 'bg-surface-2 text-muted'} ${i === today ? 'ring-2 ring-offset-1 ring-offset-bg ring-accent-line' : ''}`}
          >
            {d[0]}
          </span>
        );
      })}
    </span>
  );
}
