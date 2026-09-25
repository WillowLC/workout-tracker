// Monthly recap / Year in Lifting as a row of swipeable cards. Functional
// styling only; everything arrives pre-formatted through props.
import { useRef, useState, type ReactNode } from 'react';
import type { Muscle } from '../domain/types';
import { MuscleMap, HeatLegend, VOLUME_LEGEND, type HeatLevel } from './MuscleMap';
import { Button } from './ui';

export interface RecapStat {
  label: string;
  value: string;
  /** % change vs the previous period; null = no data to compare. */
  change?: number | null;
}

export interface RecapDisplay {
  title: string;
  /** e.g. "1–30 September 2026" */
  subtitle: string;
  headline: RecapStat[];
  totals: RecapStat[];
  comparison?: { volume: string; text: string; emoji: string };
  prCount: number;
  biggestJump?: { exercise: string; from: string; to: string; pct: number };
  heaviest?: { exercise: string; set: string };
  favourites: { label: string; value: string }[];
  muscleLevels: Partial<Record<Muscle, HeatLevel>>;
  year?: {
    monthly: { label: string; value: number; text: string }[];
    topExercises: { name: string; sets: number }[];
    prTotal: number;
    vsYearAgo: { name: string; now: string; then?: string; pct?: number }[];
    lifetime?: { volume: string; text: string; emoji: string };
  };
}

export function ChangeBadge({ change }: { change?: number | null }) {
  if (change === undefined || change === null) return null;
  const up = change >= 0;
  return (
    <span className={`text-xs font-semibold tabular ${up ? 'text-success' : 'text-danger'}`} aria-label={`${up ? 'up' : 'down'} ${Math.abs(Math.round(change))}% vs previous period`}>
      {up ? '▲' : '▼'} {Math.abs(Math.round(change))}%
    </span>
  );
}

function StatGrid({ stats }: { stats: RecapStat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      {stats.map((s) => (
        <div key={s.label} className="bg-surface-2 rounded p-3 flex flex-col gap-0.5">
          <dt className="text-xs text-muted">{s.label}</dt>
          <dd className="text-xl font-bold tabular">{s.value}</dd>
          <ChangeBadge change={s.change} />
        </div>
      ))}
    </dl>
  );
}

function RecapCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <article data-recap-card className="w-full h-full min-h-[440px] bg-surface border border-border rounded-lg p-5 flex flex-col gap-4">
      {title && <h3 className="text-xs font-bold uppercase tracking-[.08em] text-accent">{title}</h3>}
      {children}
    </article>
  );
}

export function recapCards(d: RecapDisplay): { key: string; node: ReactNode }[] {
  const cards: { key: string; node: ReactNode }[] = [
    {
      key: 'intro',
      node: (
        <RecapCard>
          <p className="text-sm text-muted">{d.subtitle}</p>
          <h2 className="text-[28px] leading-tight font-extrabold">{d.title}</h2>
          <StatGrid stats={d.headline} />
        </RecapCard>
      ),
    },
    {
      key: 'totals',
      node: (
        <RecapCard title="The work">
          <StatGrid stats={d.totals} />
          {d.comparison && (
            <p className="text-base">
              <b className="tabular">{d.comparison.volume}</b> — that’s <b>{d.comparison.text}</b> <span aria-hidden>{d.comparison.emoji}</span>
              <span className="block text-xs text-muted">Weights are approx.</span>
            </p>
          )}
        </RecapCard>
      ),
    },
    {
      key: 'prs',
      node: (
        <RecapCard title="Records">
          <p><span className="text-4xl font-extrabold tabular">{d.prCount}</span> <span className="text-muted">new PR{d.prCount === 1 ? '' : 's'}</span></p>
          {d.biggestJump && (
            <div>
              <p className="text-xs text-muted uppercase font-semibold">Biggest jump</p>
              <p className="font-semibold">{d.biggestJump.exercise}</p>
              <p className="text-sm tabular">e1RM {d.biggestJump.from} → {d.biggestJump.to} <span className="text-success font-semibold">+{d.biggestJump.pct.toFixed(1)}%</span></p>
            </div>
          )}
          {d.heaviest && (
            <div>
              <p className="text-xs text-muted uppercase font-semibold">Heaviest set</p>
              <p className="font-semibold">{d.heaviest.exercise}</p>
              <p className="text-sm tabular">{d.heaviest.set}</p>
            </div>
          )}
        </RecapCard>
      ),
    },
    {
      key: 'habits',
      node: (
        <RecapCard title="Your habits">
          <dl className="flex flex-col gap-3">
            {d.favourites.map((f) => (
              <div key={f.label}>
                <dt className="text-xs text-muted uppercase font-semibold">{f.label}</dt>
                <dd className="font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
        </RecapCard>
      ),
    },
  ];
  if (d.year) {
    const y = d.year;
    const max = Math.max(1, ...y.monthly.map((m) => m.value));
    cards.push({
      key: 'year',
      node: (
        <RecapCard title="Month by month">
          <div className="h-32 flex items-end gap-1" role="img" aria-label={`Volume by month: ${y.monthly.map((m) => `${m.label} ${m.text}`).join(', ')}`}>
            {y.monthly.map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="w-full rounded-t-sm" style={{ height: `${(m.value / max) * 100}%`, minHeight: m.value ? 2 : 0, background: 'var(--heat-3)' }} />
                <span className="text-[10px] text-muted">{m.label}</span>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs text-muted uppercase font-semibold mb-1">Top exercises</p>
            <ol className="text-sm flex flex-col gap-0.5">
              {y.topExercises.map((e, i) => <li key={e.name} className="flex justify-between gap-2"><span className="truncate">{i + 1}. {e.name}</span><span className="text-muted tabular">{e.sets} sets</span></li>)}
            </ol>
          </div>
          <p className="text-sm"><b className="tabular">{y.prTotal}</b> PRs this year</p>
        </RecapCard>
      ),
    });
    cards.push({
      key: 'vs',
      node: (
        <RecapCard title="You vs a year ago">
          {y.vsYearAgo.length === 0 && <p className="text-sm text-muted">Log weighted lifts to compare.</p>}
          <ul className="flex flex-col gap-3">
            {y.vsYearAgo.map((v) => (
              <li key={v.name}>
                <p className="font-semibold">{v.name}</p>
                <p className="text-sm tabular">e1RM {v.then ?? 'new'} → <b>{v.now}</b> {v.pct !== undefined && <ChangeBadge change={v.pct} />}</p>
              </li>
            ))}
          </ul>
          {y.lifetime && (
            <p className="text-sm text-muted mt-auto">Lifetime: <b className="text-text tabular">{y.lifetime.volume}</b> ≈ {y.lifetime.text} <span aria-hidden>{y.lifetime.emoji}</span> (approx.)</p>
          )}
        </RecapCard>
      ),
    });
  }
  cards.push({
    key: 'muscles',
    node: (
      <RecapCard title="Muscles trained">
        <MuscleMap levels={d.muscleLevels} height={260} />
        <HeatLegend labels={VOLUME_LEGEND} />
        <p className="text-xs text-muted text-center">Average weekly sets vs your target.</p>
      </RecapCard>
    ),
  });
  return cards;
}

/** Horizontally swipeable recap cards with dots and a Share button for the current card. */
export function RecapCards({ display, onShare }: { display: RecapDisplay; onShare?: (card: HTMLElement) => void }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const cards = recapCards(display);
  const go = (i: number) => {
    const el = scroller.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };
  return (
    <div className="flex flex-col gap-3">
      <div
        ref={scroller}
        className="flex overflow-x-auto snap-x snap-mandatory gap-0 [scrollbar-width:none]"
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))}
        aria-roledescription="carousel"
      >
        {cards.map((c) => <div key={c.key} className="snap-center shrink-0 w-full px-0.5">{c.node}</div>)}
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" aria-label="Previous card" disabled={index === 0} onClick={() => go(index - 1)}>◀</Button>
        <div className="flex-1 flex justify-center gap-1.5" aria-label={`Card ${index + 1} of ${cards.length}`}>
          {cards.map((c, i) => (
            <button key={c.key} type="button" aria-label={`Card ${i + 1}`} onClick={() => go(i)} className={`w-2 h-2 rounded-full ${i === index ? 'bg-accent' : 'bg-border-strong'}`} />
          ))}
        </div>
        <Button size="sm" variant="ghost" aria-label="Next card" disabled={index === cards.length - 1} onClick={() => go(index + 1)}>▶</Button>
      </div>
      {onShare && (
        <Button onClick={() => {
          const card = scroller.current?.querySelectorAll<HTMLElement>('[data-recap-card]')[index];
          if (card) onShare(card);
        }}>Share this card</Button>
      )}
    </div>
  );
}
