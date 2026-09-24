import type { ReactNode } from 'react';

export interface SummaryPR {
  exercise: string;
  set: string;
  kinds: string[];
}

/** Post-workout summary: duration, volume, sets, PRs. */
export function WorkoutSummary({ name, date, duration, volume, sets, prs, children }: { name: string; date: string; duration: string; volume: string; sets: number; prs: SummaryPR[]; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-sm text-muted">Workout complete</p>
        <h2 className="text-2xl font-bold">{name}</h2>
        <p className="text-sm text-muted">{date}</p>
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
      <section>
        <h3 className="font-semibold mb-2">{prs.length ? `🏆 ${prs.length} personal record${prs.length > 1 ? 's' : ''}` : 'No new records this time'}</h3>
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
