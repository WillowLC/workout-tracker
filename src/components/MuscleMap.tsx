// Front and back body outline with one <path> per muscle (left and right
// sides share a muscle). Placeholder artwork: every muscle shape carries
// `id` and `data-muscle`, so the drawing can be replaced without touching
// logic. Shading comes from the --heat-0 … --heat-4 tokens.
import type { Muscle } from '../domain/types';
import { MUSCLE_LABELS } from '../domain/muscles';

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

type Shape = { muscle: Muscle; side: 'l' | 'r' | 'c'; d: string };

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0 Z`;

/** Mirror a left-side shape (absolute "x,y" coordinates only) to the right; the figure is centred on x = 100. */
function pair(muscle: Muscle, left: string): Shape[] {
  const right = left.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, x, y) => `${200 - Number(x)},${y}`);
  return [{ muscle, side: 'l', d: left }, { muscle, side: 'r', d: right }];
}

// Ellipses start at their left edge; mirroring an ellipse must start at the mirrored right edge.
function pairEllipse(muscle: Muscle, cx: number, cy: number, rx: number, ry: number): Shape[] {
  return [{ muscle, side: 'l', d: ellipse(cx, cy, rx, ry) }, { muscle, side: 'r', d: ellipse(200 - cx, cy, rx, ry) }];
}

const SILHOUETTE =
  'M100,8 C113,8 120,18 120,31 C120,42 114,50 108,53 L110,57 C122,59 140,62 150,70 C158,78 160,96 162,120 L168,190 C169,198 162,200 158,196 L146,128 L140,108 L136,170 C140,200 142,230 140,262 L134,330 L132,378 L110,378 L108,330 L104,262 L100,214 L96,262 L92,330 L90,378 L68,378 L66,330 L60,262 C58,230 60,200 64,170 L60,108 L54,128 L42,196 C38,200 31,198 32,190 L38,120 C40,96 42,78 50,70 C60,62 78,59 90,57 L92,53 C86,50 80,42 80,31 C80,18 87,8 100,8 Z';

const FRONT: Shape[] = [
  ...pair('traps', 'M88,56 L72,62 L90,64 Z'),
  ...pairEllipse('side_delts', 50, 80, 6, 12),
  ...pairEllipse('front_delts', 63, 75, 10, 13),
  ...pair('chest', 'M74,66 Q88,61 98,66 L98,96 Q84,103 72,94 Q70,80 74,66 Z'),
  ...pairEllipse('biceps', 54, 113, 8, 19),
  ...pairEllipse('forearms', 45, 160, 7, 24),
  ...pair('abs', 'M89,102 L98,102 L98,166 L91,162 Q88,130 89,102 Z'),
  ...pair('obliques', 'M74,104 L86,104 Q85,136 88,164 L78,154 Q72,130 74,104 Z'),
  ...pairEllipse('abductors', 69, 190, 5, 16),
  ...pairEllipse('adductors', 94, 214, 5, 22),
  ...pairEllipse('quads', 82, 232, 13, 44),
  ...pairEllipse('calves', 80, 318, 8, 30),
];

const BACK: Shape[] = [
  { muscle: 'traps', side: 'c', d: 'M100,52 L76,64 L100,104 L124,64 Z' },
  ...pairEllipse('side_delts', 50, 80, 6, 12),
  ...pairEllipse('rear_delts', 63, 75, 10, 13),
  ...pair('upper_back', 'M80,70 L96,82 L96,112 L84,104 Q78,88 80,70 Z'),
  ...pair('lats', 'M72,84 L84,108 L96,118 L96,142 L80,134 Q70,110 72,84 Z'),
  ...pair('lower_back', 'M89,144 L98,146 L98,170 L90,168 Z'),
  ...pairEllipse('triceps', 54, 113, 8, 19),
  ...pairEllipse('forearms', 45, 160, 7, 24),
  ...pairEllipse('abductors', 69, 184, 5, 14),
  ...pairEllipse('glutes', 86, 188, 14, 16),
  ...pairEllipse('adductors', 96, 222, 4, 18),
  ...pairEllipse('hamstrings', 83, 244, 12, 36),
  ...pairEllipse('calves', 81, 310, 10, 30),
];

export interface MuscleMapProps {
  /** Shading level per muscle (missing = 0). */
  levels: Partial<Record<Muscle, HeatLevel>>;
  view?: 'front' | 'back' | 'both';
  selected?: Muscle;
  onSelect?: (m: Muscle) => void;
  /** Figure height in px (default 280). */
  height?: number;
  /** Per-muscle text for the accessible label, e.g. "12 sets". */
  describe?: (m: Muscle) => string;
}

function Figure({ side, shapes, p }: { side: 'front' | 'back'; shapes: Shape[]; p: MuscleMapProps }) {
  const h = p.height ?? 280;
  return (
    <svg viewBox="0 0 200 386" height={h} width={(h * 200) / 386} role="group" aria-label={`Muscle map, ${side}`} data-view={side} className="shrink-0">
      <path d={SILHOUETTE} fill="var(--color-body-outline)" opacity={0.45} aria-hidden />
      {shapes.map((s) => {
        const level = p.levels[s.muscle] ?? 0;
        const label = `${MUSCLE_LABELS[s.muscle]}${p.describe ? `: ${p.describe(s.muscle)}` : ''}`;
        return (
          <path
            key={`${s.muscle}-${s.side}`}
            id={`${side}-${s.muscle}-${s.side}`}
            data-muscle={s.muscle}
            data-level={level}
            d={s.d}
            fill={`var(--heat-${level})`}
            stroke={p.selected === s.muscle ? 'var(--color-text)' : 'var(--color-bg)'}
            strokeWidth={p.selected === s.muscle ? 2 : 1}
            role={p.onSelect ? 'button' : undefined}
            tabIndex={p.onSelect && s.side !== 'r' ? 0 : undefined}
            aria-label={s.side !== 'r' ? label : undefined}
            aria-hidden={s.side === 'r' ? true : undefined}
            onClick={p.onSelect ? () => p.onSelect!(s.muscle) : undefined}
            onKeyDown={p.onSelect ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), p.onSelect!(s.muscle)) : undefined}
            style={{ cursor: p.onSelect ? 'pointer' : undefined }}
          >
            <title>{label}</title>
          </path>
        );
      })}
    </svg>
  );
}

export function MuscleMap(p: MuscleMapProps) {
  const view = p.view ?? 'both';
  return (
    <div className="flex justify-center gap-4">
      {view !== 'back' && <Figure side="front" shapes={FRONT} p={p} />}
      {view !== 'front' && <Figure side="back" shapes={BACK} p={p} />}
    </div>
  );
}

/** Colour key for the map. */
export function HeatLegend({ labels }: { labels: string[] }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-muted" aria-label="Legend">
      {labels.map((l, i) => (
        <li key={l} className="inline-flex items-center gap-1">
          <span aria-hidden className="w-3 h-3 rounded-sm border border-border" style={{ background: `var(--heat-${i})` }} />
          {l}
        </li>
      ))}
    </ul>
  );
}

export const VOLUME_LEGEND = ['None', '< ½ min', '< min', 'In range', 'Over max'];
export const RECENCY_LEGEND = ['Never', '10+ days', '6–9 days', '3–5 days', '0–2 days'];
