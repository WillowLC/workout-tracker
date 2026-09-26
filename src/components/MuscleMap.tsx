// Front and back anatomical figure with one <path> per muscle (left and right
// sides share a muscle). Muscles tile the body and meet along thin seams in
// the body colour, with fibre / separation lines and soft shading drawn on
// top. Every muscle shape carries `id` and `data-muscle`, so the drawing can
// be changed without touching logic. Shading comes from --heat-0 … --heat-4.
import { useId } from 'react';
import type { Muscle } from '../domain/types';
import { MUSCLE_LABELS } from '../domain/muscles';

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

type Shape = { muscle: Muscle; side: 'l' | 'r' | 'c'; d: string };

// Figure is drawn on a 200 × 400 canvas, centred on x = 100. Left-half paths
// use absolute "x,y" pairs only, so they can be mirrored to the right.
const W = 200;
const H = 400;
const mirror = (d: string) => d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, x, y) => `${W - Number(x)},${y}`);
const both = (d: string) => [d, mirror(d)];

function pair(muscle: Muscle, ...left: string[]): Shape[] {
  return left.flatMap((d) => [{ muscle, side: 'l' as const, d }, { muscle, side: 'r' as const, d: mirror(d) }]);
}

// ---- Body (everything that isn't a tracked muscle: head, neck, hands, knees, shins, feet) ----
const BODY = [
  'M100,10 C110,10 116,19 116,30 C116,41 110,49 100,49 C90,49 84,41 84,30 C84,19 90,10 100,10 Z',
  'M91,40 L109,40 L111,60 L89,60 Z',
  ...both('M100,54 C90,56 80,58 70,61 C57,63 48,70 46,82 C44,94 47,106 52,114 C60,126 67,132 70,142 C71,158 69,170 68,180 C65,192 63,202 64,214 L100,218 Z'),
  ...both('M52,72 C43,80 38.5,96 38.5,114 C38.5,128 40,140 40.5,150 C39,166 39,184 41,204 L51,204 C52,190 55,172 57.5,158 C60,146 62,130 62,114 C62,98 59,84 56,76 Z'),
  ...both('M41,200 C37,207 37,220 40,229 C42,234 49,234 51,229 C53,220 52,207 50,200 Z'),
  ...both('M65,196 C61,214 59,240 61,264 C63,280 67,292 69,300 C67,320 67,344 71,368 L73,380 L90,380 C91,370 91,356 92,340 C94,320 96,304 94,290 C97,270 99,244 100,214 Z'),
  ...both('M72,376 C68,384 70,392 79,392 L92,392 C95,388 93,380 90,376 Z'),
];

// ---- Front ----
const FRONT: Shape[] = [
  ...pair('traps', 'M92,49 C90,55 84,59 73,62 C81,64 89,64 96,61 Z'),
  ...pair('side_delts', 'M70,61 C57,62 46,70 43,84 C41,96 42,106 45,113 C48,100 54,86 64,73 Z'),
  ...pair('front_delts', 'M72,62 C64,72 56,88 51,113 C58,111 64,103 68,94 C72,84 78,74 84,65 Z'),
  ...pair('chest_upper', 'M99,66 L86,65 C80,70 76,76 73,82 C82,80 91,79 99,79 Z'),
  ...pair('chest_mid', 'M99,79 C91,79 82,80 73,82 C71,87 70,92 70,96 C79,96 90,96 99,97 Z'),
  ...pair('chest_lower', 'M99,97 C90,96 79,96 70,96 C71,107 81,113 92,113 C95,113 97,112 99,111 Z'),
  ...pair('biceps_long', 'M47,114 C42,121 39.5,131 40,141 C41,147 46,150 50,148 C49.5,136 49.5,124 50.5,114 Z'),
  ...pair('biceps_short', 'M53,113 C52.5,124 52.5,136 52.5,148 C56,149 60,144 60.5,136 C61,126 60,117 58,111 Z'),
  ...pair('brachialis', 'M40,136 C39.5,144 40.5,150 43,154 C47,156 53,156 57.5,153 C56,150 53,150.5 50,150.5 C45,150.5 41,146 40,136 Z'),
  ...pair('forearms', 'M42,157 C40,171 40,187 42,201 L50,201 C51,187 54,171 56.5,158 C52,155 46,155 42,157 Z'),
  ...pair('abs', 'M99,115 L87,115 C86,134 86,153 88,172 C90,183 95,191 99,195 Z'),
  ...pair('obliques', 'M85,115 C77,117 72,125 71,138 C70,152 72,166 77,180 C80,185 84,189 88,191 C85,169 84,141 85,115 Z'),
  ...pair('abductors', 'M70,186 C66,194 65,203 65,214 L70,219 C71,207 73,197 77,190 Z'),
  ...pair('quads', 'M72,200 C66,214 63,236 64,258 C65,274 70,286 78,292 C85,294 90,289 91,277 C93,255 93,232 89,212 C85,205 79,200 72,200 Z'),
  ...pair('adductors', 'M99,210 C95,216 93,228 92,244 C93,251 94,255 96,256 C98,244 99,228 99,212 Z'),
  ...pair('calves', 'M69,300 C63,318 64,340 70,360 C74,363 78,359 79,350 C80,332 80,314 78,300 Z', 'M88,300 C94,316 95,336 91,354 C88,358 85,356 84,350 C83,332 84,314 86,300 Z'),
];

const FRONT_DETAIL = [
  'M100,115 L100,194',
  ...both('M87,132 C91,131 95,131 99,132'),
  ...both('M87,150 C91,149 95,149 99,150'),
  ...both('M88,168 C91,167 95,167 99,168'),
  ...both('M97,72 C92,72 86,74 81,76'),
  ...both('M97,88 C89,88 81,89 74,90'),
  ...both('M96,104 C89,106 82,106 76,103'),
  ...both('M64,71 C60,81 57,93 55,106'),
  ...both('M80,206 C78,230 78,256 82,288'),
  ...both('M89,250 C86,264 84,278 84,290'),
  ...both('M47,166 C46,178 45,188 45,198'),
  ...both('M77,146 C79,150 81,152 84,154'),
  ...both('M76,160 C78,164 80,166 85,168'),
];

// ---- Back ----
const BACK: Shape[] = [
  ...pair('traps', 'M100,47 C96,53 88,59 72,63 C80,71 88,83 93,99 C96,110 98,122 100,134 Z'),
  ...pair('side_delts', 'M66,62 C56,62 46,68 43,80 C41,92 42,104 45,112 C47,98 50,86 55,76 Z'),
  ...pair('rear_delts', 'M70,63 C61,64 54,70 51,80 C51,92 52,100 54,109 C58,98 64,88 74,80 C76,74 75,68 70,63 Z'),
  ...pair('upper_back', 'M77,80 C71,88 70,98 76,106 C82,111 88,112 94,110 C93,99 88,89 77,80 Z'),
  ...pair('lats', 'M71,100 C69,118 71,138 77,154 C83,166 90,172 96,176 C93,160 93,146 95,137 C92,126 88,118 84,113 C80,109 75,105 71,100 Z'),
  ...pair('lower_back', 'M99,136 L95,138 C92,152 91,168 93,184 L99,188 Z'),
  ...pair('triceps_lateral', 'M49,103 C43,111 39.5,124 39.5,136 C40.5,144 44.5,149 49.5,149 C49.5,134 49.5,118 51,105 Z'),
  ...pair('triceps_long', 'M54,100 C52.5,114 52,130 52.5,149 C56,150 60,144 61,136 C62,124 61,110 58.5,100 Z'),
  ...pair('forearms', 'M42,157 C40,171 40,187 42,201 L50,201 C51,187 54,171 56.5,158 C52,155 46,155 42,157 Z'),
  ...pair('abductors', 'M70,180 C67,186 66,194 67,202 C72,194 80,188 93,186 C85,182 77,180 70,180 Z'),
  ...pair('glutes', 'M99,189 C88,187 76,189 71,199 C66,211 70,224 82,230 C90,232 96,230 99,226 Z'),
  ...pair('adductors', 'M99,232 C96,238 94,248 94,260 C96,256 98,248 99,242 Z'),
  ...pair('hamstrings', 'M70,231 C65,250 66,272 72,292 C78,298 86,298 92,292 C95,272 95,250 93,234 C87,234 79,234 70,231 Z'),
  ...pair('calves', 'M71,300 C66,314 67,332 74,346 C78,352 82,350 83,342 C84,324 82,308 78,298 Z', 'M85,298 C91,306 94,322 92,340 C90,350 86,352 85,346 C84,330 84,312 85,298 Z'),
];

const BACK_DETAIL = [
  'M100,50 L100,188',
  ...both('M76,82 C80,92 86,100 94,104'),
  ...both('M80,120 C82,134 86,148 92,160'),
  ...both('M76,196 C82,204 90,208 98,210'),
  ...both('M82,236 C82,256 82,276 82,294'),
  ...both('M47,166 C46,178 45,188 45,198'),
  ...both('M78,354 C80,362 82,370 84,376'),
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

function Figure({ side, shapes, detail, p }: { side: 'front' | 'back'; shapes: Shape[]; detail: string[]; p: MuscleMapProps }) {
  const h = p.height ?? 280;
  const uid = useId().replace(/:/g, '');
  const shade = `mm-shade-${uid}`;
  const body = `mm-body-${uid}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} height={h} width={(h * W) / H} role="group" aria-label={`Muscle map, ${side}`} data-view={side} className="shrink-0 overflow-visible">
      <defs>
        {/* Light from the upper left: gives the flat shapes some volume. */}
        <linearGradient id={shade} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
        <clipPath id={body}>{BODY.map((d, i) => <path key={i} d={d} />)}</clipPath>
      </defs>
      <ellipse aria-hidden cx={W / 2} cy={H - 6} rx="34" ry="4" fill="#000" opacity="0.1" />
      <g aria-hidden fill="var(--color-border-strong)">
        {BODY.map((d, i) => <path key={i} d={d} />)}
      </g>
      {shapes.map((s) => {
        const level = p.levels[s.muscle] ?? 0;
        const label = `${MUSCLE_LABELS[s.muscle]}${p.describe ? `: ${p.describe(s.muscle)}` : ''}`;
        const isSel = p.selected === s.muscle;
        return (
          <path
            key={`${s.muscle}-${s.side}-${s.d.length}-${s.d.slice(1, 8)}`}
            id={`${side}-${s.muscle}-${s.side}`}
            data-muscle={s.muscle}
            data-level={level}
            d={s.d}
            fill={`var(--heat-${level})`}
            stroke={isSel ? 'var(--color-text)' : 'var(--color-border-strong)'}
            strokeWidth={isSel ? 2 : 1.4}
            strokeLinejoin="round"
            role={p.onSelect ? 'button' : undefined}
            tabIndex={p.onSelect && s.side !== 'r' ? 0 : undefined}
            aria-label={s.side !== 'r' ? label : undefined}
            aria-hidden={s.side === 'r' ? true : undefined}
            onClick={p.onSelect ? () => p.onSelect!(s.muscle) : undefined}
            onKeyDown={p.onSelect ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), p.onSelect!(s.muscle)) : undefined}
            style={{ cursor: p.onSelect ? 'pointer' : undefined, transition: 'fill 200ms' }}
          >
            <title>{label}</title>
          </path>
        );
      })}
      <g aria-hidden pointerEvents="none">
        <g fill="none" stroke="#000" strokeOpacity="0.16" strokeWidth="0.9" strokeLinecap="round">
          {detail.map((d, i) => <path key={i} d={d} />)}
        </g>
        <rect x="0" y="0" width={W} height={H} fill={`url(#${shade})`} clipPath={`url(#${body})`} />
      </g>
    </svg>
  );
}

export function MuscleMap(p: MuscleMapProps) {
  const view = p.view ?? 'both';
  return (
    <div className="flex justify-center gap-6">
      {view !== 'back' && <Figure side="front" shapes={FRONT} detail={FRONT_DETAIL} p={p} />}
      {view !== 'front' && <Figure side="back" shapes={BACK} detail={BACK_DETAIL} p={p} />}
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
