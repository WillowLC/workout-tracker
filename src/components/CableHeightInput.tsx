import { useEffect, useState } from 'react';

/**
 * Small inline box for a cable exercise's pulley height. Free text ("12",
 * "low"); saved when the box loses focus or Enter is pressed.
 */
export function CableHeightInput({ exerciseName, value, onSave, gymLabel }: { exerciseName: string; value?: string; onSave: (v: string) => void; gymLabel?: string }) {
  const [draft, setDraft] = useState(value ?? '');
  useEffect(() => setDraft(value ?? ''), [value]);
  const commit = () => { if (draft.trim() !== (value ?? '')) onSave(draft); };
  return (
    <label className="flex flex-col items-center gap-0.5 text-[10px] leading-tight text-muted text-center" title={gymLabel ? `Saved for ${gymLabel}` : 'Saved for workouts without a gym'}>
      <input
        type="text"
        enterKeyHint="done"
        autoComplete="off"
        aria-label={`${exerciseName} cable height`}
        placeholder="—"
        value={draft}
        maxLength={16}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
        className="w-14 h-7 px-1 rounded bg-surface-2 text-center text-xs font-semibold text-text placeholder:text-muted caret-accent focus:outline-none focus:shadow-[0_0_0_1.5px_var(--color-text)]"
      />
      Cable height
    </label>
  );
}
