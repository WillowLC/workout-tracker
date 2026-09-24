/** "BEST" line under an exercise name: best set ever + estimated 1RM. */
export function BestLine({ best, e1rm }: { best?: string; e1rm?: string }) {
  if (!best) return <p className="text-xs text-muted">No records yet</p>;
  return (
    <p className="text-xs text-muted tabular">
      <span className="font-bold tracking-[.06em] text-pr">BEST</span> {best}
      {e1rm && <span> · e1RM {e1rm}</span>}
    </p>
  );
}
