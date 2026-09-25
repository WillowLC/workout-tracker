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
import { Button, Card, ConfirmDialog, EmptyState, Sheet } from '../components/ui';
import { InstallHint } from '../components/shell';
import { JimLogo } from '../components/JimLogo';
import { ReorderList } from '../components/ReorderList';
import { WeekStrip } from '../components/WeekStrip';
import { IconChevronRight, IconFolder, IconClose } from '../components/icons';
import { GymMenu, GymSelector } from '../components/GymSelector';
import { WeeklySetsList } from '../components/WeeklySets';
import { PlateauCard, PlateauIdeas } from '../components/Plateau';
import { MuscleSelect } from '../components/MuscleSelect';
import { AddGymSheet } from './GymsScreen';
import { muscleSets, untaggedCustomExercises, weekPeriod, weeklyRows } from '../domain/muscles';
import { detectPlateaus, recentExerciseIds } from '../domain/plateau';
import { dueRecaps, recapKey } from '../domain/recap';
import type { Exercise } from '../domain/types';

export function WorkoutHome() {
  const navigate = useNavigate();
  const exMap = useExerciseMap();
  const { templates, folders, workouts, active, startWorkout, cancelActive, saveTemplate, saveTemplates, saveFolders, deleteTemplate, meta, setMeta,
    gyms, settings, exercises, setCurrentGym, snoozePlateau, dismissRecap, saveExercises } = useAppStore();
  const [gymSheet, setGymSheet] = useState<'pick' | 'add' | null>(null);
  const [plateauFor, setPlateauFor] = useState<string | null>(null);
  const [tagging, setTagging] = useState<Exercise[] | null>(null);
  const now = Date.now();
  const currentGym = gyms.find((g) => g.id === settings.currentGymId);
  const weekRows = useMemo(() => weeklyRows(muscleSets(workouts, exMap, settings.countWarmupsInStats, weekPeriod(now)), settings), [workouts, exMap, settings]);
  const plateaus = useMemo(
    () => detectPlateaus(recentExerciseIds(workouts, now), (id) => exMap.get(id)?.trackingType, workouts, settings.countWarmupsInStats, now, meta.plateauSnoozes),
    [workouts, exMap, settings.countWarmupsInStats, meta.plateauSnoozes],
  );
  const recaps = useMemo(() => dueRecaps(workouts, now, meta.dismissedRecaps), [workouts, meta.dismissedRecaps]);
  const untagged = useMemo(() => untaggedCustomExercises(exercises), [exercises]);
  const showToast = useUiStore((s) => s.showToast);
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
      <header className="sticky top-0 z-20 bg-bg pt-safe">
        <div className="flex justify-center px-2">
          <GymSelector name={currentGym?.name} onClick={() => setGymSheet(gyms.length ? 'pick' : 'add')} />
        </div>
        <h1 className="px-4" aria-label="Jim"><JimLogo className="block mx-auto mb-2 h-[37px] w-auto" /></h1>
      </header>
      {showInstall && <InstallHint ios={isIOS()} onDismiss={() => void setMeta({ installHintDismissed: true })} />}
      <main className="px-4 flex flex-col gap-6 pb-4">
        {(recaps.length > 0 || (untagged.length > 0 && !meta.tagPromptDismissed)) && (
          <section className="flex flex-col gap-2">
            {recaps.map((r) => (
              <Card key={r.dismissKey} className="p-3 flex items-center gap-2 border-accent-line">
                <button type="button" className="flex-1 text-left" onClick={() => navigate(`/history/recaps/${recapKey(r.ref)}`)}>
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-xs text-muted">Your recap is ready — tap to open</p>
                </button>
                <button type="button" aria-label={`Dismiss ${r.title}`} className="min-w-[40px] min-h-[40px] flex items-center justify-center text-muted" onClick={() => void dismissRecap(r.dismissKey)}><IconClose size={18} /></button>
              </Card>
            ))}
            {untagged.length > 0 && !meta.tagPromptDismissed && (
              <Card className="p-3 flex items-center gap-2">
                <button type="button" className="flex-1 text-left" onClick={() => setTagging(untagged)}>
                  <p className="font-semibold text-sm">Tag your custom exercises</p>
                  <p className="text-xs text-muted">{untagged.length} exercise{untagged.length === 1 ? '' : 's'} without muscles won’t count toward weekly sets.</p>
                </button>
                <button type="button" aria-label="Dismiss" className="min-w-[40px] min-h-[40px] flex items-center justify-center text-muted" onClick={() => void setMeta({ tagPromptDismissed: true })}><IconClose size={18} /></button>
              </Card>
            )}
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted uppercase">Quick start</h2>
          {active ? (
            <Button variant="primary" size="lg" onClick={() => navigate('/workout')}>Resume “{active.name}”</Button>
          ) : (
            <Button variant="primary" size="lg" onClick={() => start()}>Start empty workout</Button>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="flex-1 text-sm font-semibold text-muted uppercase">This week</h2>
            <Button size="sm" variant="ghost" onClick={() => navigate('/history?view=muscles')}>Muscles</Button>
          </div>
          <Card className="px-3 py-2">
            <WeeklySetsList rows={weekRows} limit={6} onSelect={() => navigate('/history?view=muscles')} />
          </Card>
          <PlateauCard items={plateaus.map((p) => ({ exerciseId: p.exerciseId, name: exMap.get(p.exerciseId)?.name ?? 'Unknown', weeks: p.weeks }))} onOpen={setPlateauFor} />
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
                    <span className="flex-1 min-w-0 text-xs font-bold text-muted uppercase flex items-center gap-1.5"><IconFolder size={15} /><span className="truncate">{folder}</span></span>
                    <WeekStrip plan={plan} today={today} nameOf={templateName} />
                    <IconChevronRight size={18} className="text-muted" />
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
                items={folderList.map((f) => ({ id: `folder:${f}`, title: f, icon: <IconFolder size={16} /> }))}
                onMove={(from, to) => void saveFolders(reorderFolders(folders, moveItem(folderList, from, to)))}
              />
            </section>
          )}
          {groups.filter(([, list]) => list.length > 1).map(([folder, list]) => (
            <section key={folder || '_'} className="flex flex-col gap-2">
              <h3 className="text-xs font-bold text-muted uppercase flex items-center gap-1.5">{folder ? <><IconFolder size={15} />{folder}</> : 'Templates'}</h3>
              <ReorderList
                items={list.map((t) => ({ id: t.id, title: t.name }))}
                onMove={(from, to) => void saveTemplates(renumberTemplates(moveItem(list, from, to)))}
              />
            </section>
          ))}
        </div>
      </Sheet>

      <Sheet open={gymSheet === 'pick'} title="Your gym" onClose={() => setGymSheet(null)}>
        <GymMenu gyms={gyms} currentId={settings.currentGymId} allowNone
          onPick={(id) => { void setCurrentGym(id); setGymSheet(null); }}
          onAdd={() => setGymSheet('add')}
          onManage={() => { setGymSheet(null); navigate('/settings/gyms'); }} />
        <p className="text-xs text-muted mt-2">New workouts are tagged with this gym, and PREVIOUS shows what you did here last time.</p>
      </Sheet>
      <AddGymSheet open={gymSheet === 'add'} onClose={() => setGymSheet(null)} makeCurrent />

      <Sheet open={!!plateauFor} title="Plateau" onClose={() => setPlateauFor(null)}>
        {plateauFor && (
          <div className="flex flex-col gap-2">
            <PlateauIdeas exercise={exMap.get(plateauFor)?.name ?? ''} weeks={plateaus.find((p) => p.exerciseId === plateauFor)?.weeks ?? 6}
              onSnooze={() => { void snoozePlateau(plateauFor); setPlateauFor(null); showToast('Plateau alert hidden for 4 weeks'); }} />
            <Button variant="ghost" onClick={() => { const id = plateauFor; setPlateauFor(null); navigate(`/exercises/${id}`); }}>View exercise history</Button>
          </div>
        )}
      </Sheet>

      <Sheet open={!!tagging} title="Tag your custom exercises" onClose={() => setTagging(null)}
        footer={tagging && <Button variant="primary" className="flex-1" onClick={async () => {
          const done = tagging.filter((e) => e.primaryMuscles?.length);
          await saveExercises(done);
          setTagging(null);
          showToast(`Tagged ${done.length} exercise${done.length === 1 ? '' : 's'}`);
          if (done.length === tagging.length) void setMeta({ tagPromptDismissed: true });
        }}>Save</Button>}>
        {tagging && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-muted">Pick at least one primary muscle for each, so they count toward weekly sets and the muscle map.</p>
            {tagging.map((e, i) => (
              <div key={e.id} className="flex flex-col gap-1">
                <p className="font-semibold">{e.name}</p>
                <MuscleSelect label="Muscles" primary={e.primaryMuscles ?? []} secondary={e.secondaryMuscles ?? []}
                  onChange={(p, s) => setTagging((cur) => cur && cur.map((x, j) => (j === i ? { ...x, primaryMuscles: p, secondaryMuscles: s } : x)))} />
              </div>
            ))}
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
