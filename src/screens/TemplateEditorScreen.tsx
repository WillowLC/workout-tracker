import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { SetType, Template } from '../domain/types';
import { useAppStore } from '../store/appStore';
import { useRecentExerciseIds, useExerciseMap } from '../store/selectors';
import {
  addTemplateExercises, addTemplateSet, emptyTemplate, linkTemplateSuperset, removeTemplateExercise,
  removeTemplateSet, setTemplateSet, unlinkTemplateSuperset,
} from '../domain/templates';
import { moveBlock } from '../domain/workoutOps';
import { blocks, sortedExercises, supersetInfo } from '../domain/superset';
import { setLabels } from '../domain/sets';
import { Button, EmptyState, Field, IconButton, MenuList, PageHeader, Sheet, inputClass } from '../components/ui';
import { SetTypeBadge, SetTypeLetter } from '../components/SetTypeBadge';
import { SupersetBracket, SupersetTag } from '../components/SupersetBracket';
import { ExercisePicker } from '../components/ExercisePicker';
import { ReorderList } from '../components/ReorderList';
import { NumberInput } from '../components/inputs';

export function TemplateEditorScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { templates, exercises, saveTemplate } = useAppStore();
  const exMap = useExerciseMap();
  const recentIds = useRecentExerciseIds();
  const existing = templates.find((t) => t.id === id);
  const [t, setT] = useState<Template>(() => (existing ? structuredClone(existing) : emptyTemplate()));
  const [picker, setPicker] = useState<{ supersetWith?: number } | null>(null);
  const [menu, setMenu] = useState<number | null>(null);
  const [typeMenu, setTypeMenu] = useState<{ order: number; index: number } | null>(null);
  const [ssFor, setSsFor] = useState<number | null>(null);
  const [reorder, setReorder] = useState(false);

  const sorted = useMemo(() => sortedExercises(t), [t]);
  const groups = useMemo(() => supersetInfo(t.exercises), [t.exercises]);
  const folders = useMemo(() => [...new Set(templates.map((x) => x.folder).filter(Boolean))] as string[], [templates]);
  const nameOf = (exerciseId: string) => exMap.get(exerciseId)?.name ?? 'Unknown';

  const save = async () => {
    await saveTemplate({ ...t, name: t.name.trim() || 'Untitled Template', folder: t.folder?.trim() || undefined });
    navigate('/');
  };

  const card = (order: number) => {
    const te = t.exercises.find((e) => e.order === order)!;
    const labels = setLabels(te.sets);
    const g = te.supersetGroupId ? groups.get(te.supersetGroupId) : undefined;
    return (
      <article key={order} className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-3 pt-2">
          {g && <SupersetTag letter={g.letter} colorIndex={g.colorIndex} />}
          <p className="flex-1 font-semibold truncate">{nameOf(te.exerciseId)}</p>
          <IconButton label={`${nameOf(te.exerciseId)} options`} onClick={() => setMenu(order)}>⋯</IconButton>
        </div>
        <div className="px-3 py-2 flex flex-col gap-1">
          <div className="grid grid-cols-[2.25rem_1fr_2.75rem] gap-2 text-[11px] font-semibold text-muted uppercase">
            <span className="text-center">Set</span><span>Target reps (optional)</span><span />
          </div>
          {te.sets.map((s, i) => (
            <div key={i} className="grid grid-cols-[2.25rem_1fr_2.75rem] gap-2 items-center">
              <SetTypeBadge type={s.type} label={labels[i]} onClick={() => setTypeMenu({ order, index: i })} />
              <NumberInput aria-label={`Set ${labels[i]} target reps`} decimals={false} value={s.targetReps} placeholder="—" onChange={(v) => setT((cur) => setTemplateSet(cur, order, i, { targetReps: v }))} />
              <IconButton label={`Remove set ${labels[i]}`} onClick={() => setT((cur) => removeTemplateSet(cur, order, i))}>✕</IconButton>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setT((cur) => addTemplateSet(cur, order))} className="w-full min-h-[44px] text-sm font-medium bg-surface-2 border-t border-border">+ Add Set</button>
      </article>
    );
  };

  const chooseType = (type: SetType) => {
    if (!typeMenu) return;
    const cur = t.exercises.find((e) => e.order === typeMenu.order)!.sets[typeMenu.index].type;
    setT((x) => setTemplateSet(x, typeMenu.order, typeMenu.index, { type: cur === type ? 'normal' : type }));
    setTypeMenu(null);
  };
  const menuTe = t.exercises.find((e) => e.order === menu);
  const ssTe = t.exercises.find((e) => e.order === ssFor);

  return (
    <div className="pb-24">
      <PageHeader title={existing ? 'Edit Template' : 'New Template'} left={<Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>} right={<Button variant="primary" size="sm" onClick={save}>Save</Button>} />
      <main className="px-4 flex flex-col gap-3 max-w-2xl mx-auto">
        <Field label="Name"><input className={inputClass} value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} /></Field>
        <Field label="Folder (optional)">
          <input className={inputClass} list="folders" value={t.folder ?? ''} onChange={(e) => setT({ ...t, folder: e.target.value })} />
          <datalist id="folders">{folders.map((f) => <option key={f} value={f} />)}</datalist>
        </Field>
        <p className="text-xs text-muted">Templates store structure only. Weights come from each exercise's previous performance when you start.</p>
        {sorted.length === 0 && <EmptyState title="Empty template" message="Add the exercises you want in this routine." />}
        {blocks(sorted).map((b) => {
          const g = b[0].supersetGroupId ? groups.get(b[0].supersetGroupId) : undefined;
          return g && b.length > 1 ? (
            <SupersetBracket key={b[0].supersetGroupId} letter={g.letter} colorIndex={g.colorIndex}>{b.map((te) => card(te.order))}</SupersetBracket>
          ) : card(b[0].order);
        })}
        <Button size="lg" onClick={() => setPicker({})}>+ Add Exercises</Button>
      </main>

      <Sheet open={!!menuTe} title={menuTe ? nameOf(menuTe.exerciseId) : ''} onClose={() => setMenu(null)}>
        {menuTe && (
          <MenuList items={[
            { label: 'Superset with…', onClick: () => { setSsFor(menuTe.order); setMenu(null); } },
            ...(menuTe.supersetGroupId ? [{ label: 'Remove from superset', onClick: () => { setT((x) => unlinkTemplateSuperset(x, menuTe.order)); setMenu(null); } }] : []),
            { label: 'Reorder exercises', onClick: () => { setReorder(true); setMenu(null); } },
            { label: 'Remove exercise', danger: true, onClick: () => { setT((x) => removeTemplateExercise(x, menuTe.order)); setMenu(null); } },
          ]} />
        )}
      </Sheet>
      <Sheet open={!!typeMenu} title="Set type" onClose={() => setTypeMenu(null)}>
        <MenuList items={[
          { label: 'Warm-up', icon: <SetTypeLetter type="warmup" />, onClick: () => chooseType('warmup') },
          { label: 'Drop set', icon: <SetTypeLetter type="drop" />, onClick: () => chooseType('drop') },
          { label: 'Failure', icon: <SetTypeLetter type="failure" />, onClick: () => chooseType('failure') },
          { label: 'Normal', icon: '', onClick: () => chooseType('normal') },
        ]} />
      </Sheet>
      <Sheet open={!!ssTe} title="Superset with…" onClose={() => setSsFor(null)}>
        {ssTe && (
          <MenuList items={[
            ...sorted.filter((e) => e.order !== ssTe.order && (!ssTe.supersetGroupId || e.supersetGroupId !== ssTe.supersetGroupId))
              .map((e) => ({ label: nameOf(e.exerciseId), onClick: () => { setT((x) => linkTemplateSuperset(x, ssTe.order, e.order)); setSsFor(null); } })),
            { label: '+ Add new exercise from library', onClick: () => { setPicker({ supersetWith: ssTe.order }); setSsFor(null); } },
          ]} />
        )}
      </Sheet>
      <Sheet open={reorder} title="Reorder exercises" onClose={() => setReorder(false)} footer={<Button variant="primary" className="flex-1" onClick={() => setReorder(false)}>Done</Button>}>
        <ReorderList
          items={blocks(sorted).map((b) => ({ id: String(b[0].order) + ':' + b[0].exerciseId, title: b.map((te) => nameOf(te.exerciseId)).join(' + ') }))}
          onMove={(from, to) => setT((x) => ({ ...x, exercises: moveBlock(x.exercises, from, to) }))}
        />
      </Sheet>
      {picker && (
        <ExercisePicker
          title={picker.supersetWith !== undefined ? 'Superset with…' : 'Add Exercises'}
          exercises={exercises.filter((e) => !e.archived)}
          recentIds={recentIds}
          multiSelect={picker.supersetWith === undefined}
          onCancel={() => setPicker(null)}
          onDone={(ids) => {
            const p = picker;
            setPicker(null);
            setT((x) => {
              const added = addTemplateExercises(x, ids);
              if (p.supersetWith === undefined) return added;
              return linkTemplateSuperset(added, p.supersetWith, added.exercises.length - 1);
            });
          }}
        />
      )}
    </div>
  );
}
