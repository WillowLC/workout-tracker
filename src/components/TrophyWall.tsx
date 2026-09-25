import { IconTrophy } from './icons';

export interface TrophyItem {
  id: string;
  exercise: string;
  /** "Best set", "e1RM", "Volume" */
  kind: string;
  value: string;
  /** Undefined = first ever. */
  was?: string;
  date: string;
  onOpen?: () => void;
}

/** Every PR ever, newest first, grouped by month. */
export function TrophyWall({ headline, groups }: { headline: string; groups: { month: string; items: TrophyItem[] }[] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-bold flex items-center gap-2"><IconTrophy size={22} className="text-pr" />{headline}</p>
      {groups.length === 0 && <p className="text-sm text-muted">No PRs match. Finish a workout that beats a record and it lands here.</p>}
      {groups.map((g) => (
        <section key={g.month} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted uppercase">{g.month}</h2>
          <ul className="flex flex-col gap-2">
            {g.items.map((it) => (
              <li key={it.id}>
                <button type="button" onClick={it.onOpen} disabled={!it.onOpen} className="w-full text-left bg-surface border border-border rounded-lg p-3 flex gap-3 items-start">
                  <IconTrophy size={20} className="text-pr mt-0.5" />
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold truncate">{it.exercise}</span>
                    <span className="block text-sm tabular">{it.kind}: <b>{it.value}</b></span>
                    <span className="block text-xs text-muted">{it.was ? `Beat ${it.was}` : 'First ever'} · {it.date}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
