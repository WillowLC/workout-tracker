import type { Suggestion } from '../domain/progression';

export type HintKind = Suggestion['kind'];

const TONE: Record<HintKind, string> = {
  increase: 'text-hint-up border-hint-up',
  hold: 'text-hint-hold border-border-control',
  decrease: 'text-hint-down border-hint-down',
};
const ARROW: Record<HintKind, string> = { increase: '↑', hold: '→', decrease: '↓' };

/**
 * Small chip under the BEST line: "↑ Try 82.5 kg × 8". Tapping applies the
 * suggested weight to the exercise's remaining working sets.
 */
export function ProgressionHint({ kind, text, onApply }: { kind: HintKind; text: string; onApply?: () => void }) {
  return (
    <button
      type="button"
      onClick={onApply}
      disabled={!onApply}
      aria-label={`${text}. Tap to use this weight for the remaining sets`}
      className={`self-start inline-flex items-center gap-1 rounded-full border px-2 h-6 text-xs font-semibold tabular ${TONE[kind]}`}
    >
      <span aria-hidden>{ARROW[kind]}</span>
      {text}
    </button>
  );
}
