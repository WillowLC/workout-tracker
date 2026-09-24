import type { ReactNode } from 'react';
import { BestLine } from './BestLine';
import { SetTableHeader, type SetColumn } from './SetRow';
import { SupersetTag } from './SupersetBracket';
import { IconButton } from './ui';

export interface ExerciseCardProps {
  name: string;
  best?: string;
  e1rm?: string;
  exerciseNote?: string;
  sessionNote?: string;
  restLabel?: string;
  superset?: { letter: string; colorIndex: number };
  columns: SetColumn[];
  showRpe: boolean;
  children: ReactNode; // SetRows
  onMenu?: () => void;
  onNameClick?: () => void;
  onAddSet?: () => void;
}

export function ExerciseCard(p: ExerciseCardProps) {
  return (
    <article className="bg-surface rounded-lg border border-border overflow-hidden" aria-label={p.name}>
      <div className="flex items-start gap-2 px-3 pt-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {p.superset && <SupersetTag {...p.superset} />}
            <button type="button" onClick={p.onNameClick} className="font-semibold text-accent text-left truncate">
              {p.name}
            </button>
          </div>
          <BestLine best={p.best} e1rm={p.e1rm} />
          {p.exerciseNote && <p className="text-xs text-muted mt-0.5">📌 {p.exerciseNote}</p>}
          {p.sessionNote && <p className="text-xs mt-0.5">{p.sessionNote}</p>}
          {p.restLabel && <p className="text-xs text-muted">Rest: {p.restLabel}</p>}
        </div>
        {p.onMenu && <IconButton label={`${p.name} options`} onClick={p.onMenu}>⋯</IconButton>}
      </div>
      <div className="py-2 flex flex-col gap-1">
        <SetTableHeader columns={p.columns} showRpe={p.showRpe} />
        {p.children}
      </div>
      {p.onAddSet && (
        <button type="button" onClick={p.onAddSet} className="w-full min-h-[44px] text-sm font-medium bg-surface-2 border-t border-border">
          + Add Set
        </button>
      )}
    </article>
  );
}
