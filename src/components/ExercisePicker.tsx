import { useState } from 'react';
import type { Exercise } from '../domain/types';
import { ExerciseList } from './ExerciseList';
import { Button } from './ui';

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
      <div className="flex items-center gap-2 px-2 min-h-[52px]">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <h2 className="flex-1 text-center font-semibold">{title}</h2>
        {multiSelect ? (
          <Button variant="primary" size="sm" disabled={!selected.length} onClick={() => onDone(selected)}>
            Add{selected.length ? ` (${selected.length})` : ''}
          </Button>
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
