import type { ReactNode } from 'react';

const COLOR = ['border-ss1 text-ss1', 'border-ss2 text-ss2', 'border-ss3 text-ss3', 'border-ss4 text-ss4'];

/** Wraps adjacent exercises of one superset with a coloured bracket and label. */
export function SupersetBracket({ letter, colorIndex, children }: { letter: string; colorIndex: number; children: ReactNode }) {
  return (
    <section aria-label={`Superset ${letter}`} className={`border-l-4 rounded-l pl-2 ${COLOR[colorIndex % 4]}`}>
      <p className="text-xs font-bold uppercase tracking-wide mb-1">Superset {letter}</p>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function SupersetTag({ letter, colorIndex }: { letter: string; colorIndex: number }) {
  return <span className={`text-xs font-bold border rounded px-1 ${COLOR[colorIndex % 4]}`}>{letter}</span>;
}
