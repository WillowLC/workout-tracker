import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Template } from '../domain/types';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { WEEK_DAYS, emptyWeekPlan, groupTemplatesByFolder, moveItem, patchFolderInfo, setPlanDay, weekdayIndex } from '../domain/templates';
import { cycleSlots, folderMode, suggestForFolder, whenLabel } from '../domain/schedule';
import { daysAgo } from '../lib/format';
import { Button, Card, ConfirmDialog, EmptyState, MenuList, PageHeader, Sheet, Tabs, inputClass } from '../components/ui';
import { ReorderList } from '../components/ReorderList';
import { IconChevronLeft, IconChevronRight, IconFolder, IconMoon, IconWorkout } from '../components/icons';

/** A folder's schedule: a weekly split (a template or rest per weekday), or a repeating cycle of workouts and rest days. */
export function FolderPlanScreen() {
  const { name = '' } = useParams();
  const navigate = useNavigate();
  const { templates, folders, workouts, active, saveFolders, renameFolder, startWorkout, cancelActive } = useAppStore();
  const showToast = useUiStore((s) => s.showToast);
  const [pickDay, setPickDay] = useState<number | null>(null);
  const [addingSlot, setAddingSlot] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [pendingStart, setPendingStart] = useState<Template | null>(null);

  const list = useMemo(() => groupTemplatesByFolder(templates, folders).find(([f]) => f === name)?.[1] ?? [], [templates, folders, name]);
  const info = folders.find((f) => f.name === name);
  const plan = info?.plan ?? emptyWeekPlan();
  const mode = folderMode(info);
  const slots = cycleSlots(info, list);
  const byId = useMemo(() => new Map(templates.map((t) => [t.id, t])), [templates]);
  const now = Date.now();
  const today = weekdayIndex(now);
  const sg = useMemo(() => suggestForFolder(name, info, list, workouts, now), [name, info, list, workouts]);
  const todays = sg?.templateId && !sg.doneToday ? byId.get(sg.templateId) : undefined;
  const upNext = sg && !todays && sg.next ? byId.get(sg.next.templateId) : undefined;
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
  const saveCycle = (cycle: (string | null)[]) => void saveFolders(patchFolderInfo(folders, name, { cycle }));
  const setMode = (m: 'weekly' | 'cycle') => void saveFolders(patchFolderInfo(folders, name, { mode: m }));
  const scheduledOn = (id: string) => mode === 'weekly'
    ? plan.map((p, i) => (p === id ? WEEK_DAYS[i].slice(0, 3) : null)).filter(Boolean).join(', ') || 'not scheduled'
    : slots.map((p, i) => (p === id ? `Day ${i + 1}` : null)).filter(Boolean).join(', ') || 'not in cycle';

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
              <p className="text-xs font-semibold text-accent uppercase">Today · {mode === 'weekly' ? WEEK_DAYS[today] : `Day ${(sg?.slot ?? 0) + 1} of ${slots.length}`}</p>
              <p className="font-semibold truncate">{todays.name}</p>
            </div>
            <Button variant="primary" onClick={() => start(todays)}>Start</Button>
          </Card>
        )}
        {upNext && sg?.next && (
          <Card className="p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-muted uppercase">{sg.doneToday ? 'Done today' : 'Rest day'} · next {whenLabel(sg.next.inDays, now).toLowerCase()}</p>
              <p className="font-semibold truncate">{upNext.name}</p>
            </div>
            <Button onClick={() => start(upNext)}>Start</Button>
          </Card>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted uppercase">Schedule</h2>
          <Tabs value={mode} onChange={setMode} options={[{ value: 'weekly', label: 'Days of the week' }, { value: 'cycle', label: 'Repeating cycle' }]} />
          <p className="text-xs text-muted">
            {mode === 'weekly'
              ? 'The same workout on the same weekday, every week.'
              : 'Workouts in order, then start over, whatever the weekday. For example Push, Pull, Legs, Rest. Each rest day takes one day. A missed workout waits for you instead of being skipped.'}
          </p>
        </section>

        {mode === 'cycle' ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-muted uppercase">Cycle</h2>
            <span className="text-xs text-muted">{slots.length}-day cycle · {slots.filter(Boolean).length} workout{slots.filter(Boolean).length === 1 ? '' : 's'}</span>
          </div>
          <ReorderList
            items={slots.map((id, i) => ({
              id: `slot-${i}`,
              title: id ? byId.get(id)?.name ?? 'Workout' : 'Rest day',
              subtitle: `Day ${i + 1}${sg?.slot === i && !sg.doneToday ? ' · today' : ''}`,
              icon: id ? <IconWorkout size={16} /> : <IconMoon size={16} />,
            }))}
            onMove={(from, to) => saveCycle(moveItem(slots, from, to))}
            onRemove={slots.length > 1 ? (i) => saveCycle(slots.filter((_, j) => j !== i)) : undefined}
          />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={() => setAddingSlot(true)}>+ Workout</Button>
            <Button className="flex-1" onClick={() => saveCycle([...slots, null])}>+ Rest day</Button>
          </div>
        </section>
        ) : (
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
        )}

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted uppercase">Templates</h2>
          {list.map((t) => (
            <Card key={t.id} className="p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{t.name}</p>
                <p className="text-xs text-muted">
                  {lastPerformed.has(t.id) ? `Last done: ${daysAgo(lastPerformed.get(t.id)!)}` : 'Never done'}
                  {' · '}
                  {scheduledOn(t.id)}
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

      <Sheet open={addingSlot} title="Add to cycle" onClose={() => setAddingSlot(false)}>
        <MenuList items={list.map((t) => ({ label: t.name, icon: <IconWorkout size={18} />, onClick: () => { setAddingSlot(false); saveCycle([...slots, t.id]); } }))} />
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
