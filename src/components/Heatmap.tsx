/** Training-day strip: columns are weeks, rows are Mon..Sun. */
export function Heatmap({ weeks }: { weeks: { date: number; count: number }[][] }) {
  const total = weeks.flat().filter((d) => d.count > 0).length;
  return (
    <figure aria-label={`${total} training days in the last ${weeks.length} weeks`} className="flex flex-col gap-1">
      <div className="flex gap-[3px]">
        {weeks.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px] flex-1">
            {col.map((d) => (
              <div
                key={d.date}
                title={new Date(d.date).toDateString()}
                className={`aspect-square rounded-sm ${d.count < 0 ? 'bg-transparent' : d.count > 0 ? 'bg-success' : 'bg-surface-2 border border-border'}`}
              />
            ))}
          </div>
        ))}
      </div>
      <figcaption className="text-xs text-muted">
        {total} training day{total === 1 ? '' : 's'} in the last {weeks.length} weeks
      </figcaption>
    </figure>
  );
}
