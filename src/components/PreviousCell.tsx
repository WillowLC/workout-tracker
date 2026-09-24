/** PREVIOUS column: last session's matching set. Tap to copy into the inputs. */
export function PreviousCell({ text, onClick }: { text: string; onClick?: () => void }) {
  const empty = text === '—';
  return (
    <button
      type="button"
      disabled={empty}
      onClick={onClick}
      aria-label={empty ? 'No previous' : `Previous: ${text}. Tap to copy`}
      className="min-w-0 min-h-[36px] text-[13px] text-muted truncate whitespace-nowrap tabular text-center"
    >
      {text}
    </button>
  );
}
