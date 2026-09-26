/** "You lifted **8,450 kg** today — that's about **7 grand pianos** (approx.)" */
export function VolumeComparisonLine({ lead = 'You lifted', volume, when = 'today', comparison, className = '' }: {
  lead?: string;
  volume: string;
  when?: string;
  /** e.g. "about 7 grand pianos" */
  comparison: string;
  className?: string;
}) {
  return (
    <p className={`text-base leading-snug ${className}`}>
      {lead} <b className="tabular">{volume}</b>{when ? ` ${when}` : ''} — that’s <b>{comparison}</b>
      <span className="block text-xs text-muted">Weights are approx.</span>
    </p>
  );
}

/** "Lifetime: 1.2 million kg ≈ 3 Space Stations" */
export function LifetimeLine({ volume, comparison }: { volume: string; comparison: string }) {
  return (
    <p className="text-sm text-muted">
      Lifetime: <b className="text-text tabular">{volume}</b> ≈ {comparison} <span className="text-xs">(approx.)</span>
    </p>
  );
}
