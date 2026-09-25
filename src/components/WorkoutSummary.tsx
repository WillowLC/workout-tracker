import type { ReactNode } from 'react';
import type { Inspiration } from '../domain/inspiration';
import { ordinal } from '../domain/inspiration';
import { IconBulb, IconQuote, IconTrophy } from './icons';

export interface SummaryPR {
  exercise: string;
  set: string;
  kinds: string[];
}

/** Post-workout summary: congratulations, stats, a quote or fun fact, PRs. */
export function WorkoutSummary({ name, date, duration, volume, sets, prs, count, inspiration, children }: {
  name: string;
  date: string;
  duration: string;
  volume: string;
  sets: number;
  prs: SummaryPR[];
  /** This workout's number in the user's history (1 = first ever). */
  count: number;
  inspiration?: Inspiration;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="text-center flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[.08em] text-accent">Workout complete</p>
        <h2 className="text-[28px] leading-tight font-extrabold">Congratulations!</h2>
        <p className="text-base">
          You’ve completed your <span className="font-bold text-accent tabular">{ordinal(count)}</span> workout!
        </p>
        <p className="text-sm text-muted mt-1">{name} · {date}</p>
      </div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          ['Duration', duration],
          ['Volume', volume],
          ['Sets', String(sets)],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface-2 rounded p-3">
            <dt className="text-xs text-muted">{k}</dt>
            <dd className="font-bold tabular">{v}</dd>
          </div>
        ))}
      </dl>
      {inspiration && (
        <figure className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-2">
          <figcaption className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.08em] text-muted">
            {inspiration.kind === 'quote' ? <IconQuote size={16} /> : <IconBulb size={16} />}
            {inspiration.kind === 'quote' ? 'Words to lift by' : 'Did you know?'}
          </figcaption>
          {inspiration.kind === 'quote' ? (
            <>
              <blockquote className="text-[17px] leading-snug font-semibold">“{inspiration.text}”</blockquote>
              <p className="text-sm text-muted">— {inspiration.author}</p>
            </>
          ) : (
            <p className="text-[16px] leading-snug">{inspiration.text}</p>
          )}
        </figure>
      )}
      <section>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          {prs.length ? (
            <>
              <IconTrophy size={20} className="text-pr" />
              {prs.length} personal record{prs.length > 1 ? 's' : ''}
            </>
          ) : (
            'No new records this time'
          )}
        </h3>
        <ul className="flex flex-col gap-1">
          {prs.map((p, i) => (
            <li key={i} className="text-sm flex justify-between gap-2 border-b border-border py-1">
              <span>{p.exercise}</span>
              <span className="text-muted text-right">
                {p.set} · {p.kinds.join(', ')}
              </span>
            </li>
          ))}
        </ul>
      </section>
      {children}
    </div>
  );
}
