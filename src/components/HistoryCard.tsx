export interface HistoryCardProps {
  name: string;
  date: string;
  duration: string;
  volume: string;
  prCount: number;
  exercises: { line: string; best: string }[];
  onClick?: () => void;
}

/** Summary card for a finished workout in the History list. */
export function HistoryCard(p: HistoryCardProps) {
  return (
    <button type="button" onClick={p.onClick} className="w-full text-left bg-surface rounded-lg border border-border p-3 flex flex-col gap-2">
      <div>
        <p className="font-semibold">{p.name}</p>
        <p className="text-xs text-muted">{p.date}</p>
      </div>
      <p className="text-xs text-muted flex gap-3">
        <span>⏱ {p.duration}</span>
        <span>🏋 {p.volume}</span>
        {p.prCount > 0 && <span className="text-pr font-semibold">🏆 {p.prCount} PR{p.prCount > 1 ? 's' : ''}</span>}
      </p>
      <div className="grid grid-cols-[1fr_auto] gap-x-3 text-sm">
        <span className="text-xs font-semibold text-muted">Exercise</span>
        <span className="text-xs font-semibold text-muted text-right">Best set</span>
        {p.exercises.map((e, i) => (
          <div key={i} className="contents">
            <span className="truncate">{e.line}</span>
            <span className="text-right tabular text-muted">{e.best}</span>
          </div>
        ))}
      </div>
    </button>
  );
}
