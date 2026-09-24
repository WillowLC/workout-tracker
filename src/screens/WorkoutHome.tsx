import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Template, Workout } from '../domain/types';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { useExerciseMap } from '../store/selectors';
import { duplicateTemplate, groupTemplatesByFolder } from '../domain/templates';
import { sortedExercises } from '../domain/superset';
import { relativeDays } from '../lib/format';
import { isIOS, isStandalone } from '../pwa/storage';
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, Sheet } from '../components/ui';
import { InstallHint } from '../components/shell';

export function WorkoutHome() {
  const navigate = useNavigate();
  const { templates, workouts, active, startWorkout, cancelActive, saveTemplate, deleteTemplate, meta, setMeta } = useAppStore();
  const showToast = useUiStore((s) => s.showToast);
  const exMap = useExerciseMap();
  const [preview, setPreview] = useState<Template | null>(null);
  const [pendingStart, setPendingStart] = useState<{ template?: Template } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Template | null>(null);

  const lastPerformed = useMemo(() => {
    const m = new Map<string, number>();
    for (const w of workouts) if (w.templateId) m.set(w.templateId, Math.max(m.get(w.templateId) ?? 0, w.startedAt));
    return m;
  }, [workouts]);

  const doStart = (from?: { template?: Template; repeat?: Workout }) => {
    startWorkout(from);
    navigate('/workout');
  };
  const start = (template?: Template) => {
    setPreview(null);
    if (active) setPendingStart({ template });
    else doStart({ template });
  };

  const showInstall = !meta.installHintDismissed && !isStandalone();

  return (
    <div>
      <PageHeader title={<span className="block text-center text-2xl text-accent">Jim</span>} />
      {showInstall && <InstallHint ios={isIOS()} onDismiss={() => void setMeta({ installHintDismissed: true })} />}
      <main className="px-4 flex flex-col gap-6 pb-4">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted uppercase">Quick start</h2>
          {active ? (
            <Button variant="primary" size="lg" onClick={() => navigate('/workout')}>Resume “{active.name}”</Button>
          ) : (
            <Button variant="primary" size="lg" onClick={() => start()}>Start empty workout</Button>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted uppercase">Templates</h2>
            <Button size="sm" onClick={() => navigate('/templates/new')}>+ Template</Button>
          </div>
          {templates.length === 0 && (
            <Card>
              <EmptyState title="No templates yet" message="Create a template for workouts you repeat, or save one from the summary after finishing a workout." />
            </Card>
          )}
          {groupTemplatesByFolder(templates).map(([folder, list]) => (
            <div key={folder || '_'} className="flex flex-col gap-2">
              {folder && <h3 className="text-xs font-bold text-muted uppercase">📁 {folder}</h3>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {list.map((t) => (
                  <button key={t.id} type="button" onClick={() => setPreview(t)} className="text-left bg-surface border border-border rounded-lg p-3 min-h-[72px]">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted line-clamp-2">
                      {sortedExercises(t).map((te) => exMap.get(te.exerciseId)?.name ?? '?').join(', ') || 'No exercises'}
                    </p>
                    {lastPerformed.get(t.id) && <p className="text-xs text-muted mt-1">Last: {relativeDays(lastPerformed.get(t.id)!)}</p>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      <Sheet
        open={!!preview}
        title={preview?.name}
        onClose={() => setPreview(null)}
        footer={preview && <Button variant="primary" size="lg" className="flex-1" onClick={() => start(preview)}>Start Workout</Button>}
      >
        {preview && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted">
              {lastPerformed.get(preview.id) ? `Last performed ${relativeDays(lastPerformed.get(preview.id)!)}` : 'Never performed'}
              {preview.folder ? ` · ${preview.folder}` : ''}
            </p>
            <ul className="flex flex-col gap-1">
              {sortedExercises(preview).map((te) => (
                <li key={te.order} className="flex justify-between text-sm border-b border-border py-1">
                  <span>{te.sets.length} × {exMap.get(te.exerciseId)?.name ?? 'Unknown'}</span>
                  {te.supersetGroupId && <span className="text-muted">superset</span>}
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { const id = preview.id; setPreview(null); navigate(`/templates/${id}`); }}>Edit</Button>
              <Button size="sm" onClick={async () => { await saveTemplate(duplicateTemplate(preview)); setPreview(null); showToast('Template duplicated'); }}>Duplicate</Button>
              <Button size="sm" className="!text-danger" onClick={() => { setConfirmDelete(preview); setPreview(null); }}>Delete</Button>
            </div>
          </div>
        )}
      </Sheet>

      <ConfirmDialog
        open={!!pendingStart}
        title="Workout in progress"
        message="You already have a workout in progress. Resume it, or discard it and start a new one?"
        onClose={() => setPendingStart(null)}
        actions={[
          { label: 'Resume current workout', variant: 'primary', onClick: () => { setPendingStart(null); navigate('/workout'); } },
          { label: 'Discard and start new', variant: 'danger', onClick: async () => { const p = pendingStart; setPendingStart(null); await cancelActive(); doStart(p ?? undefined); } },
        ]}
      />
      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete “${confirmDelete?.name}”?`}
        onClose={() => setConfirmDelete(null)}
        actions={[{
          label: 'Delete template', variant: 'danger', onClick: async () => {
            const t = confirmDelete!;
            setConfirmDelete(null);
            await deleteTemplate(t.id);
            showToast('Template deleted', () => void saveTemplate(t));
          },
        }]}
      />
    </div>
  );
}
