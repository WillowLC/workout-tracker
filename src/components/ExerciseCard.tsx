import type { ReactNode } from 'react';
import { BestLine } from './BestLine';
import { SetTableHeader, type SetColumn } from './SetRow';
import { SupersetTag } from './SupersetBracket';

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
      <div className="flex items-start gap-2 pl-3.5 pr-1.5 pt-3.5 pb-2.5">
        <div className="flex-1 min-w-0 flex flex-col gap-[5px]">
          <div className="flex items-center gap-[7px] min-w-0">
            {p.superset && <SupersetTag {...p.superset} />}
            <button type="button" onClick={p.onNameClick} className="min-w-0 truncate text-left text-[17px] font-semibold">
              {p.name}
            </button>
          </div>
          <BestLine best={p.best} e1rm={p.e1rm} />
          {p.exerciseNote && <p className="text-xs text-muted">{p.exerciseNote}</p>}
          {p.sessionNote && <p className="text-xs text-secondary">{p.sessionNote}</p>}
          {p.restLabel && <p className="text-xs text-muted">Rest {p.restLabel}</p>}
        </div>
        {p.onMenu && (
          <button type="button" aria-label={`${p.name} options`} title={`${p.name} options`} onClick={p.onMenu}
            className="-mt-2 w-11 h-11 flex items-center justify-center text-lg font-bold text-muted">
            ⋯
          </button>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-1 pb-1.5">
        <SetTableHeader columns={p.columns} showRpe={p.showRpe} />
        {p.children}
      </div>
      {p.onAddSet && (
        <button type="button" onClick={p.onAddSet} className="w-full h-11 border-t border-border text-sm font-semibold text-accent">
          + Add Set
        </button>
      )}
    </article>
  );
}
