import { useState } from 'react';
import type { BodyPart, Equipment, Exercise, TrackingType } from '../domain/types';
import { BODY_PARTS, EQUIPMENT, TRACKING_TYPES } from '../domain/types';
import { Button, Field, inputClass } from './ui';

export type ExerciseDraft = Pick<Exercise, 'name' | 'bodyPart' | 'equipment' | 'trackingType' | 'notes' | 'defaultRestSeconds'>;

/** Create/edit form. Seeded exercises can only edit notes and rest time. */
export function ExerciseForm({ initial, seeded, onSubmit, submitLabel }: { initial?: Partial<ExerciseDraft>; seeded?: boolean; onSubmit: (d: ExerciseDraft) => void; submitLabel: string }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [bodyPart, setBodyPart] = useState<BodyPart>(initial?.bodyPart ?? 'Chest');
  const [equipment, setEquipment] = useState<Equipment>(initial?.equipment ?? 'Barbell');
  const [trackingType, setTracking] = useState<TrackingType>(initial?.trackingType ?? 'weight_reps');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [rest, setRest] = useState(initial?.defaultRestSeconds !== undefined ? String(initial.defaultRestSeconds) : '');
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const r = rest.trim() === '' ? undefined : Math.max(0, Math.round(Number(rest)));
        onSubmit({ name: name.trim(), bodyPart, equipment, trackingType, notes: notes.trim() || undefined, defaultRestSeconds: Number.isFinite(r) ? r : undefined });
      }}
    >
      <Field label="Name">
        <input className={inputClass} value={name} disabled={seeded} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chest Press (Hammer Strength)" required />
      </Field>
      <Field label="Body part">
        <select className={inputClass} value={bodyPart} disabled={seeded} onChange={(e) => setBodyPart(e.target.value as BodyPart)}>
          {BODY_PARTS.map((b) => <option key={b}>{b}</option>)}
        </select>
      </Field>
      <Field label="Equipment">
        <select className={inputClass} value={equipment} disabled={seeded} onChange={(e) => setEquipment(e.target.value as Equipment)}>
          {EQUIPMENT.map((b) => <option key={b}>{b}</option>)}
        </select>
      </Field>
      <Field label="Tracking">
        <select className={inputClass} value={trackingType} disabled={seeded} onChange={(e) => setTracking(e.target.value as TrackingType)}>
          {TRACKING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </Field>
      <Field label="Note (shown every time)">
        <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. seat height 4" />
      </Field>
      <Field label="Default rest (seconds)" hint="Leave empty to use the global default.">
        <input className={inputClass} inputMode="numeric" value={rest} onChange={(e) => setRest(e.target.value.replace(/\D/g, ''))} />
      </Field>
      <Button type="submit" variant="primary">{submitLabel}</Button>
    </form>
  );
}
