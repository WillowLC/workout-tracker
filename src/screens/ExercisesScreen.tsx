import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { useRecentExerciseIds } from '../store/selectors';
import { ExerciseList } from '../components/ExerciseList';
import { ExerciseForm } from '../components/ExerciseForm';
import { Button, PageHeader, Sheet } from '../components/ui';

export function ExercisesScreen() {
  const navigate = useNavigate();
  const { exercises, createExercise } = useAppStore();
  const recentIds = useRecentExerciseIds();
  const [creating, setCreating] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Exercises" right={<Button size="sm" onClick={() => setCreating('')}>+ New</Button>} />
      <ExerciseList exercises={exercises} recentIds={recentIds} showArchivedToggle onPick={(e) => navigate(`/exercises/${e.id}`)} onCreate={(name) => setCreating(name)} />
      <Sheet open={creating !== null} title="New exercise" onClose={() => setCreating(null)}>
        {creating !== null && (
          <ExerciseForm
            initial={{ name: creating }}
            submitLabel="Create exercise"
            onSubmit={async (d) => {
              const e = await createExercise(d);
              setCreating(null);
              navigate(`/exercises/${e.id}`);
            }}
          />
        )}
      </Sheet>
    </div>
  );
}
