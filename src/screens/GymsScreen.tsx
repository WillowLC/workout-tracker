import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Gym } from '../domain/types';
import { newId } from '../domain/ids';
import { useAppStore } from '../store/appStore';
import { useUiStore } from '../store/uiStore';
import { Button, Card, ConfirmDialog, EmptyState, PageHeader, Sheet, inputClass } from '../components/ui';
import { IconCheck, IconChevronLeft, IconPin } from '../components/icons';

/** Sheet to create a gym. `makeCurrent` also selects it for new workouts. */
export function AddGymSheet({ open, onClose, onAdded, makeCurrent }: { open: boolean; onClose: () => void; onAdded?: (g: Gym) => void; makeCurrent?: boolean }) {
  const saveGym = useAppStore((s) => s.saveGym);
  const setCurrentGym = useAppStore((s) => s.setCurrentGym);
  const [name, setName] = useState('');
  const submit = async () => {
    const n = name.trim();
    if (!n) return;
    const g: Gym = { id: newId(), name: n };
    await saveGym(g);
    if (makeCurrent) await setCurrentGym(g.id);
    setName('');
    onAdded?.(g);
    onClose();
  };
  return (
    <Sheet open={open} title="Add gym" onClose={onClose} footer={<Button variant="primary" className="flex-1" disabled={!name.trim()} onClick={() => void submit()}>Add gym</Button>}>
      <form onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <input className={inputClass} aria-label="Gym name" placeholder="e.g. SATS Nørrebro" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </form>
      <p className="text-xs text-muted mt-2">Each gym remembers its own PREVIOUS weights. BEST and PRs stay global.</p>
    </Sheet>
  );
}

export function GymsScreen() {
  const navigate = useNavigate();
  const { gyms, workouts, settings, saveGym, deleteGym, setCurrentGym } = useAppStore();
  const showToast = useUiStore((s) => s.showToast);
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState<Gym | null>(null);
  const [draft, setDraft] = useState('');
  const [deleting, setDeleting] = useState<Gym | null>(null);
  const count = (id: string) => workouts.filter((w) => w.gymId === id).length;
  const sorted = [...gyms].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="pb-8">
      <PageHeader title="Gyms" left={<Button variant="ghost" aria-label="Back" onClick={() => navigate(-1)}><IconChevronLeft size={20} /></Button>} right={<Button size="sm" onClick={() => setAdding(true)}>+ Add</Button>} />
      <main className="px-4 flex flex-col gap-3">
        {gyms.length === 0 ? (
          <Card><EmptyState title="No gyms yet" message="Add the gyms you train at. PREVIOUS then shows what you did last time at that gym." action={<Button variant="primary" onClick={() => setAdding(true)}>Add your gym</Button>} /></Card>
        ) : (
          <Card>
            <ul>
              {sorted.map((g) => (
                <li key={g.id} className="flex items-center gap-2 px-3 min-h-[56px] border-b border-border last:border-0">
                  <button type="button" onClick={() => void setCurrentGym(g.id)} className="flex-1 min-w-0 text-left flex items-center gap-2" aria-label={`Use ${g.name} for new workouts`}>
                    <IconPin size={16} className="text-muted" />
                    <span className="min-w-0">
                      <span className="block truncate">{g.name}{g.demo ? ' (demo)' : ''}</span>
                      <span className="block text-xs text-muted">{count(g.id)} workouts</span>
                    </span>
                    {settings.currentGymId === g.id && <IconCheck size={18} className="text-accent" />}
                  </button>
                  <Button size="sm" variant="ghost" onClick={() => { setRenaming(g); setDraft(g.name); }}>Rename</Button>
                  <Button size="sm" variant="ghost" className="!text-danger" onClick={() => setDeleting(g)}>Delete</Button>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {gyms.length > 0 && (
          <Button onClick={() => void setCurrentGym(undefined)} disabled={!settings.currentGymId}>Don’t tag new workouts with a gym</Button>
        )}
      </main>
      <AddGymSheet open={adding} onClose={() => setAdding(false)} makeCurrent={!settings.currentGymId} />
      <Sheet open={!!renaming} title="Rename gym" onClose={() => setRenaming(null)}
        footer={<Button variant="primary" className="flex-1" disabled={!draft.trim()} onClick={() => { if (renaming) void saveGym({ ...renaming, name: draft.trim() }); setRenaming(null); }}>Save</Button>}>
        <input className={inputClass} aria-label="Gym name" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} />
      </Sheet>
      <ConfirmDialog open={!!deleting} title={`Delete “${deleting?.name}”?`} message="Its workouts are kept; they just won’t have a gym any more." onClose={() => setDeleting(null)}
        actions={[{ label: 'Delete gym', variant: 'danger', onClick: async () => { const g = deleting!; setDeleting(null); await deleteGym(g.id); showToast(`Deleted “${g.name}”`); } }]} />
    </div>
  );
}
