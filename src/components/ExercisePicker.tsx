import { useState } from 'react';
import type { Exercise } from '../domain/types';
import { ExerciseList } from './ExerciseList';

/** Full-screen library picker. Multi-select for "+ Add Exercises"; single for replace / superset. */
export function ExercisePicker({ title, exercises, recentIds, multiSelect, onDone, onCancel, onCreate }: {
  title: string;
  exercises: Exercise[];
  recentIds?: string[];
  multiSelect?: boolean;
  onDone: (ids: string[]) => void;
  onCancel: () => void;
  onCreate?: (name: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col pt-safe" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex items-center gap-2 px-3 h-[52px]">
        <button type="button" onClick={onCancel} className="h-11 px-2 text-base text-secondary">Cancel</button>
        <h2 className="flex-1 text-center text-[17px] font-bold truncate">{title}</h2>
        {multiSelect ? (
          <button type="button" disabled={!selected.length} onClick={() => onDone(selected)}
            className="h-9 px-3.5 rounded-md bg-accent text-accent-contrast text-[15px] font-bold tabular disabled:opacity-40">
            Add{selected.length ? ` (${selected.length})` : ''}
          </button>
        ) : (
          <span className="w-[72px]" />
        )}
      </div>
      <div className="flex-1 overflow-y-auto pb-safe">
        <ExerciseList
          exercises={exercises}
          recentIds={recentIds}
          multiSelect={multiSelect}
          selectedIds={selected}
          onCreate={onCreate}
          onPick={(e) => (multiSelect ? setSelected((s) => (s.includes(e.id) ? s.filter((x) => x !== e.id) : [...s, e.id])) : onDone([e.id]))}
        />
      </div>
    </div>
  );
}
