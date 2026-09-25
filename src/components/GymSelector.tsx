import { IconChevronDown, IconPin } from './icons';
import { MenuList } from './ui';

/** Small, unobtrusive current-gym control: "📍 SATS Nørrebro ▾", or "Add your gym". */
export function GymSelector({ name, onClick }: { name?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={name ? `Current gym: ${name}. Change gym` : 'Add your gym'}
      className="inline-flex items-center gap-1 min-h-[32px] px-2 rounded text-xs font-medium text-muted">
      <IconPin size={14} />
      <span className="truncate max-w-[220px]">{name ?? 'Add your gym'}</span>
      {name && <IconChevronDown size={14} />}
    </button>
  );
}

/** Contents of the gym dropdown: gyms, "Add gym…", "Manage gyms". */
export function GymMenu({ gyms, currentId, onPick, onAdd, onManage, allowNone }: {
  gyms: { id: string; name: string }[];
  currentId?: string;
  onPick: (id: string | undefined) => void;
  onAdd: () => void;
  onManage?: () => void;
  /** Offer "No gym" (e.g. for a single workout). */
  allowNone?: boolean;
}) {
  return (
    <MenuList
      items={[
        ...gyms.map((g) => ({ label: g.name, active: g.id === currentId, onClick: () => onPick(g.id) })),
        ...(allowNone ? [{ label: 'No gym', active: !currentId, onClick: () => onPick(undefined) }] : []),
        { label: 'Add gym…', onClick: onAdd },
        ...(onManage ? [{ label: 'Manage gyms', onClick: onManage }] : []),
      ]}
    />
  );
}
