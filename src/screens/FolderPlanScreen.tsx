import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Template } from '../domain/types';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { WEEK_DAYS, emptyWeekPlan, groupTemplatesByFolder, setPlanDay, weekdayIndex } from '../domain/templates';
import { daysAgo } from '../lib/format';
import { Button, Card, ConfirmDialog, EmptyState, MenuList, PageHeader, Sheet, inputClass } from '../components/ui';
import { IconChevronLeft, IconChevronRight, IconFolder, IconMoon, IconWorkout } from '../components/icons';

/** Weekly split for one folder: pick a template or rest for each day of the week. */
export function FolderPlanScreen() {
  const { name = '' } = useParams();
  const navigate = useNavigate();
  const { templates, folders, workouts, active, saveFolders, renameFolder, startWorkout, cancelActive } = useAppStore();
  const showToast = useUiStore((s) => s.showToast);
  const [pickDay, setPickDay] = useState<number | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [pendingStart, setPendingStart] = useState<Template | null>(null);

  const list = useMemo(() => groupTemplatesByFolder(templates, folders).find(([f]) => f === name)?.[1] ?? [], [templates, folders, name]);
  const plan = folders.find((f) => f.name === name)?.plan ?? emptyWeekPlan();
  const byId = useMemo(() => new Map(templates.map((t) => [t.id, t])), [templates]);
  const today = weekdayIndex(Date.now());
  const todays = plan[today] ? byId.get(plan[today]!) : undefined;
  const lastPerformed = useMemo(() => {
    const m = new Map<string, number>();
    for (const w of workouts) if (w.templateId) m.set(w.templateId, Math.max(m.get(w.templateId) ?? 0, w.startedAt));
    return m;
  }, [workouts]);

  if (!list.length) {
    return (
      <div>
        <PageHeader title="Folder" left={<Button variant="ghost" aria-label="Back" onClick={() => navigate('/')}><IconChevronLeft size={20} /></Button>} />
        <EmptyState title="Folder not found" message="It has no templates any more." action={<Button onClick={() => navigate('/')}>Go home</Button>} />
      </div>
    );
  }

  const choose = async (templateId: string | null) => {
    const day = pickDay!;
    setPickDay(null);
    await saveFolders(setPlanDay(folders, name, day, templateId));
  };
  const doStart = (t: Template) => { startWorkout({ template: t }); navigate('/workout'); };
  const start = (t: Template) => (active ? setPendingStart(t) : doStart(t));
  const workoutDays = plan.filter((id) => id && byId.has(id)).length;

  return (
    <div className="pb-8">
      <PageHeader
        title={<span className="flex items-center gap-2"><IconFolder size={22} className="text-muted" /><span className="truncate">{name}</span></span>}
        left={<Button variant="ghost" aria-label="Back" onClick={() => navigate('/')}><IconChevronLeft size={20} /></Button>}
        right={<Button size="sm" onClick={() => setRenaming(name)}>Rename</Button>}
      />
      <main className="px-4 flex flex-col gap-5">
        {todays && (
          <Card className="p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-accent uppercase">Today · {WEEK_DAYS[today]}</p>
              <p className="font-semibold truncate">{todays.name}</p>
            </div>
            <Button variant="primary" onClick={() => start(todays)}>Start</Button>
          </Card>
        )}

        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-muted uppercase">Weekly split</h2>
            <span className="text-xs text-muted">{workoutDays} workout{workoutDays === 1 ? '' : 's'} · {7 - workoutDays} rest</span>
          </div>
          <ul className="bg-surface border border-border rounded-lg divide-y divide-border">
            {WEEK_DAYS.map((d, i) => {
              const t = plan[i] ? byId.get(plan[i]!) : undefined;
              return (
                <li key={d}>
                  <button type="button" onClick={() => setPickDay(i)} className="w-full min-h-[56px] px-3 flex items-center gap-3 text-left">
                    <span className={`w-10 text-sm font-bold ${i === today ? 'text-accent' : 'text-muted'}`}>{d.slice(0, 3)}</span>
                    <span className="flex-1 min-w-0">
                      {t ? <span className="block font-semibold truncate">{t.name}</span> : <span className="block text-muted">Rest day</span>}
                      {i === today && <span className="block text-xs text-accent">Today</span>}
                    </span>
                    <IconChevronRight size={18} className="text-muted" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted uppercase">Templates</h2>
          {list.map((t) => (
            <Card key={t.id} className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{t.name}</p>
                <p className="text-xs text-muted">
                  {lastPerformed.has(t.id) ? `Last done: ${daysAgo(lastPerformed.get(t.id)!)}` : 'Never done'}
                  {' · '}
                  {plan.map((id, i) => (id === t.id ? WEEK_DAYS[i].slice(0, 3) : null)).filter(Boolean).join(', ') || 'not scheduled'}
                </p>
              </div>
              <Button size="sm" onClick={() => start(t)}>Start</Button>
            </Card>
          ))}
          <Button onClick={() => navigate(`/templates/new?folder=${encodeURIComponent(name)}`)}>+ Template in this folder</Button>
        </section>
      </main>

      <Sheet open={pickDay !== null} title={pickDay !== null ? WEEK_DAYS[pickDay] : ''} onClose={() => setPickDay(null)}>
        {pickDay !== null && (
          <MenuList items={[
            { label: 'Rest day', icon: <IconMoon size={18} />, active: !plan[pickDay], onClick: () => void choose(null) },
            ...list.map((t) => ({ label: t.name, icon: <IconWorkout size={18} />, active: plan[pickDay] === t.id, onClick: () => void choose(t.id) })),
          ]} />
        )}
      </Sheet>

      <Sheet
        open={renaming !== null}
        title="Rename folder"
        onClose={() => setRenaming(null)}
        footer={
          <Button variant="primary" className="flex-1" disabled={!renaming?.trim()} onClick={async () => {
            const to = renaming!.trim();
            setRenaming(null);
            if (to === name) return;
            if (templates.some((t) => t.folder === to)) { showToast(`A folder called “${to}” already exists`); return; }
            await renameFolder(name, to);
            navigate(`/folders/${encodeURIComponent(to)}`, { replace: true });
          }}>Save</Button>
        }
      >
        <input className={inputClass} aria-label="Folder name" autoFocus value={renaming ?? ''} onChange={(e) => setRenaming(e.target.value)} />
      </Sheet>

      <ConfirmDialog
        open={!!pendingStart}
        title="Workout in progress"
        message="You already have a workout in progress. Resume it, or discard it and start a new one?"
        onClose={() => setPendingStart(null)}
        actions={[
          { label: 'Resume current workout', variant: 'primary', onClick: () => { setPendingStart(null); navigate('/workout'); } },
          { label: 'Discard and start new', variant: 'danger', onClick: async () => { const t = pendingStart!; setPendingStart(null); await cancelActive(); doStart(t); } },
        ]}
      />
    </div>
  );
}
