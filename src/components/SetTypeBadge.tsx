import type { SetType } from '../domain/types';

const TONE: Record<SetType, string> = {
  normal: 'text-text font-semibold text-[15px]',
  warmup: 'text-warmup font-bold text-sm',
  drop: 'text-drop font-bold text-sm',
  failure: 'text-failure font-bold text-sm',
};

const NAMES: Record<SetType, string> = { normal: 'Set', warmup: 'Warm-up set', drop: 'Drop set', failure: 'Failure set' };

/** The SET column cell. Tapping opens the set-type menu. */
export function SetTypeBadge({ type, label, onClick }: { type: SetType; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${NAMES[type]} ${label}. Change set type`}
      className={`w-full h-10 flex items-center justify-center tabular ${TONE[type]}`}
    >
      {label}
    </button>
  );
}

const LETTER: Record<Exclude<SetType, 'normal'>, string> = { warmup: 'W', drop: 'D', failure: 'F' };

/** Coloured W / D / F letter, used as the icon in set-type menus. */
export function SetTypeLetter({ type }: { type: Exclude<SetType, 'normal'> }) {
  return <span className={`font-bold ${TONE[type]}`}>{LETTER[type]}</span>;
}
