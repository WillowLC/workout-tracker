import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Template, Workout } from '../domain/types';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { useExerciseMap } from '../store/selectors';
import { duplicateTemplate, groupTemplatesByFolder, moveItem, renumberTemplates, reorderFolders, weekdayIndex } from '../domain/templates';
import { sortedExercises } from '../domain/superset';
import { daysAgo } from '../lib/format';
import { isIOS, isStandalone } from '../pwa/storage';
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, Sheet } from '../components/ui';
import { InstallHint } from '../components/shell';
import { JimLogo } from '../components/JimLogo';
import { ReorderList } from '../components/ReorderList';
import { WeekStrip } from '../components/WeekStrip';

export function WorkoutHome() {
  const navigate = useNavigate();
  const { templates, folders, workouts, active, startWorkout, cancelActive, saveTemplate, saveTemplates, saveFolders, deleteTemplate, meta, setMeta } = useAppStore();
  const showToast = useUiStore((s) => s.showToast);
  const exMap = useExerciseMap();
  const [preview, setPreview] = useState<Template | null>(null);
  const [pendingStart, setPendingStart] = useState<{ template?: Template } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Template | null>(null);
  const [reordering, setReordering] = useState(false);
  const groups = useMemo(() => groupTemplatesByFolder(templates, folders), [templates, folders]);
  const folderList = groups.map(([f]) => f).filter(Boolean);
  const today = weekdayIndex(Date.now());
  const templateName = (id: string) => templates.find((t) => t.id === id)?.name;

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
      <PageHeader title={<JimLogo className="block mx-auto my-2 h-[37px] w-auto" />} />
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
          <div className="flex items-center gap-2">
            <h2 className="flex-1 text-sm font-semibold text-muted uppercase">Templates</h2>
            {(folderList.length > 1 || groups.some(([, l]) => l.length > 1)) && <Button size="sm" variant="ghost" onClick={() => setReordering(true)}>Reorder</Button>}
            <Button size="sm" onClick={() => navigate('/templates/new')}>+ Template</Button>
          </div>
          {templates.length === 0 && (
            <Card>
              <EmptyState title="No templates yet" message="Create a template for workouts you repeat, or save one from the summary after finishing a workout." />
            </Card>
          )}
          {groups.map(([folder, list]) => {
            const plan = folders.find((f) => f.name === folder)?.plan;
            const todayId = plan?.[today] ?? undefined;
            return (
              <div key={folder || '_'} className="flex flex-col gap-2">
                {folder && (
                  <button
                    type="button"
                    onClick={() => navigate(`/folders/${encodeURIComponent(folder)}`)}
                    aria-label={`Folder ${folder}: weekly plan`}
                    className="flex items-center gap-2 min-h-[44px] -mx-1 px-1 rounded text-left"
                  >
                    <span className="flex-1 min-w-0 text-xs font-bold text-muted uppercase truncate">📁 {folder}</span>
                    <WeekStrip plan={plan} today={today} nameOf={templateName} />
                    <span aria-hidden className="text-muted">›</span>
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {list.map((t) => {
                    const last = lastPerformed.get(t.id);
                    const isToday = todayId === t.id;
                    return (
                      <button key={t.id} type="button" onClick={() => setPreview(t)} className={`text-left bg-surface border rounded-lg p-3 min-h-[72px] ${isToday ? 'border-accent-line' : 'border-border'}`}>
                        <div className="flex items-start gap-2">
                          <p className="flex-1 min-w-0 font-semibold">{t.name}</p>
                          {isToday && <span className="shrink-0 rounded-full bg-accent-soft text-accent text-[11px] font-semibold px-2 py-0.5">Today</span>}
                          <span className={`shrink-0 text-xs mt-0.5 ${last ? 'text-secondary' : 'text-muted'}`}>{last ? daysAgo(last) : 'Never done'}</span>
                        </div>
                        <p className="text-xs text-muted line-clamp-2">
                          {sortedExercises(t).map((te) => exMap.get(te.exerciseId)?.name ?? '?').join(', ') || 'No exercises'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
              {lastPerformed.get(preview.id) ? `Last done: ${daysAgo(lastPerformed.get(preview.id)!).toLowerCase()}` : 'Never performed'}
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

      <Sheet open={reordering} title="Reorder" onClose={() => setReordering(false)} footer={<Button variant="primary" className="flex-1" onClick={() => setReordering(false)}>Done</Button>}>
        <div className="flex flex-col gap-5">
          {folderList.length > 1 && (
            <section className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-muted uppercase">Folders</h3>
              <ReorderList
                items={folderList.map((f) => ({ id: `folder:${f}`, title: `📁 ${f}` }))}
                onMove={(from, to) => void saveFolders(reorderFolders(folders, moveItem(folderList, from, to)))}
              />
            </section>
          )}
          {groups.filter(([, list]) => list.length > 1).map(([folder, list]) => (
            <section key={folder || '_'} className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-muted uppercase">{folder ? `📁 ${folder}` : 'Templates'}</h3>
              <ReorderList
                items={list.map((t) => ({ id: t.id, title: t.name }))}
                onMove={(from, to) => void saveTemplates(renumberTemplates(moveItem(list, from, to)))}
              />
            </section>
          ))}
        </div>
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
