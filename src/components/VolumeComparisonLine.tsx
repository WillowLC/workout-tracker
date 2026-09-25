/** "You lifted **8,450 kg** today — that's about **7 grand pianos** 🎹 (approx.)" */
export function VolumeComparisonLine({ lead = 'You lifted', volume, when = 'today', comparison, emoji, className = '' }: {
  lead?: string;
  volume: string;
  when?: string;
  /** e.g. "about 7 grand pianos" */
  comparison: string;
  emoji: string;
  className?: string;
}) {
  return (
    <p className={`text-base leading-snug ${className}`}>
      {lead} <b className="tabular">{volume}</b>{when ? ` ${when}` : ''} — that’s <b>{comparison}</b> <span aria-hidden>{emoji}</span>
      <span className="block text-xs text-muted">Weights are approx.</span>
    </p>
  );
}

/** "Lifetime: 1.2 million kg ≈ 3 Space Stations 🛰️" */
export function LifetimeLine({ volume, comparison, emoji }: { volume: string; comparison: string; emoji: string }) {
  return (
    <p className="text-sm text-muted">
      Lifetime: <b className="text-text tabular">{volume}</b> ≈ {comparison} <span aria-hidden>{emoji}</span> <span className="text-xs">(approx.)</span>
    </p>
  );
}
