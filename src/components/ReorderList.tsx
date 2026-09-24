import { DndContext, closestCenter, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface ReorderItem {
  id: string;
  title: string;
  subtitle?: string;
}

function Row({ item, index, count, onMove }: { item: ReorderItem; index: number; count: number; onMove: (from: number, to: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 bg-surface border border-border rounded px-2 min-h-[52px] ${isDragging ? 'shadow-lg relative z-10' : ''}`}
    >
      <button type="button" aria-label={`Drag ${item.title}`} className="min-w-[40px] min-h-[44px] text-muted touch-none cursor-grab" {...attributes} {...listeners}>
        ☰
      </button>
      <span className="flex-1 min-w-0">
        <span className="block truncate font-medium">{item.title}</span>
        {item.subtitle && <span className="block text-xs text-muted truncate">{item.subtitle}</span>}
      </span>
      <button type="button" aria-label={`Move ${item.title} up`} disabled={index === 0} onClick={() => onMove(index, index - 1)} className="min-w-[40px] min-h-[44px] disabled:opacity-30">↑</button>
      <button type="button" aria-label={`Move ${item.title} down`} disabled={index === count - 1} onClick={() => onMove(index, index + 1)} className="min-w-[40px] min-h-[44px] disabled:opacity-30">↓</button>
    </li>
  );
}

/** Drag-to-reorder list (touch, mouse, keyboard) with ↑/↓ buttons as an accessible fallback. */
export function ReorderList({ items, onMove }: { items: ReorderItem[]; onMove: (from: number, to: number) => void }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = items.findIndex((i) => i.id === e.active.id);
    const to = items.findIndex((i) => i.id === e.over!.id);
    onMove(from, to);
  };
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {items.map((it, i) => <Row key={it.id} item={it} index={i} count={items.length} onMove={onMove} />)}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
