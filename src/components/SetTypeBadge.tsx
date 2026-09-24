import type { SetType } from '../domain/types';

const TONE: Record<SetType, string> = {
  normal: 'text-text',
  warmup: 'text-warmup',
  drop: 'text-drop',
  failure: 'text-failure',
};

const NAMES: Record<SetType, string> = { normal: 'Set', warmup: 'Warm-up set', drop: 'Drop set', failure: 'Failure set' };

/** The SET column cell. Tapping opens the set-type menu. */
export function SetTypeBadge({ type, label, onClick }: { type: SetType; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${NAMES[type]} ${label}. Change set type`}
      className={`w-full min-h-[36px] rounded bg-surface-2 font-semibold tabular ${TONE[type]}`}
    >
      {label}
    </button>
  );
}
