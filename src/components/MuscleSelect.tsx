import type { Muscle } from '../domain/types';
import { MUSCLES } from '../domain/types';
import { MUSCLE_LABELS } from '../domain/muscles';
import { Chip } from './ui';

/**
 * Muscle multi-select: tap once for primary, again for secondary, again to clear.
 */
export function MuscleSelect({ primary, secondary, onChange, label = 'Muscles' }: {
  primary: Muscle[];
  secondary: Muscle[];
  onChange: (primary: Muscle[], secondary: Muscle[]) => void;
  label?: string;
}) {
  const cycle = (m: Muscle) => {
    if (primary.includes(m)) onChange(primary.filter((x) => x !== m), [...secondary, m]);
    else if (secondary.includes(m)) onChange(primary, secondary.filter((x) => x !== m));
    else onChange([...primary, m], secondary);
  };
  return (
    <fieldset className="flex flex-col gap-1 text-sm">
      <legend className="text-muted mb-1">{label} <span className="text-xs">(tap: primary → secondary → off)</span></legend>
      <div className="flex flex-wrap gap-1.5">
        {MUSCLES.map((m) => {
          const role = primary.includes(m) ? 'primary' : secondary.includes(m) ? 'secondary' : undefined;
          return (
            <Chip key={m} selected={!!role} onClick={() => cycle(m)}>
              <span aria-label={`${MUSCLE_LABELS[m]}${role ? `, ${role}` : ''}`}>
                {MUSCLE_LABELS[m]}{role === 'primary' ? ' ●' : role === 'secondary' ? ' ○' : ''}
              </span>
            </Chip>
          );
        })}
      </div>
      <p className="text-xs text-muted">● primary (1 set each) · ○ secondary (½ set each)</p>
    </fieldset>
  );
}
