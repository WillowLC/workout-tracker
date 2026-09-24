import type { ReactNode } from 'react';

// Static class lists so Tailwind can see them.
const BAR = ['bg-ss1', 'bg-ss2', 'bg-ss3', 'bg-ss4'];
const TEXT = ['text-ss1', 'text-ss2', 'text-ss3', 'text-ss4'];
const TAG = ['border-ss1 text-ss1', 'border-ss2 text-ss2', 'border-ss3 text-ss3', 'border-ss4 text-ss4'];

/** Groups adjacent exercises of one superset: a coloured bar on the left and a "SUPERSET A" label. */
export function SupersetBracket({ letter, colorIndex, children }: { letter: string; colorIndex: number; children: ReactNode }) {
  const i = colorIndex % 4;
  return (
    <section aria-label={`Superset ${letter}`} className="flex gap-2">
      <div aria-hidden className={`w-[3px] flex-none rounded-sm ${BAR[i]}`} />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <p className={`px-0.5 pt-0.5 text-[11px] font-bold uppercase tracking-[.08em] ${TEXT[i]}`}>Superset {letter}</p>
        {children}
      </div>
    </section>
  );
}

/** Letter chip next to an exercise name. */
export function SupersetTag({ letter, colorIndex }: { letter: string; colorIndex: number }) {
  return (
    <span className={`flex-none w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center text-[11px] font-bold ${TAG[colorIndex % 4]}`}>
      {letter}
    </span>
  );
}
