import { useState } from 'react';
import type { BodyPart, Equipment, Exercise, Muscle, TrackingType } from '../domain/types';
import { BODY_PARTS, EQUIPMENT, TRACKING_TYPES } from '../domain/types';
import { MUSCLE_LABELS } from '../domain/muscles';
import { Button, Field, inputClass } from './ui';
import { MuscleSelect } from './MuscleSelect';

export type ExerciseDraft = Pick<Exercise, 'name' | 'bodyPart' | 'equipment' | 'trackingType' | 'notes' | 'primaryMuscles' | 'secondaryMuscles'>;

/** Create/edit form. Seeded exercises can only edit their note. Custom exercises need a primary muscle. */
export function ExerciseForm({ initial, seeded, onSubmit, submitLabel }: { initial?: Partial<ExerciseDraft>; seeded?: boolean; onSubmit: (d: ExerciseDraft) => void; submitLabel: string }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [bodyPart, setBodyPart] = useState<BodyPart>(initial?.bodyPart ?? 'Chest');
  const [equipment, setEquipment] = useState<Equipment>(initial?.equipment ?? 'Barbell');
  const [trackingType, setTracking] = useState<TrackingType>(initial?.trackingType ?? 'weight_reps');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [primary, setPrimary] = useState<Muscle[]>(initial?.primaryMuscles ?? []);
  const [secondary, setSecondary] = useState<Muscle[]>(initial?.secondaryMuscles ?? []);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        if (!seeded && !primary.length) {
          setError('Choose at least one primary muscle.');
          return;
        }
        onSubmit({
          name: name.trim(), bodyPart, equipment, trackingType, notes: notes.trim() || undefined,
          ...(seeded ? {} : { primaryMuscles: primary, secondaryMuscles: secondary }),
        });
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
      {seeded ? (
        <p className="text-sm"><span className="text-muted">Muscles: </span>{(initial?.primaryMuscles ?? []).map((m) => MUSCLE_LABELS[m]).join(', ')}
          {initial?.secondaryMuscles?.length ? <span className="text-muted"> · also {initial.secondaryMuscles.map((m) => MUSCLE_LABELS[m]).join(', ')}</span> : null}</p>
      ) : (
        <MuscleSelect primary={primary} secondary={secondary} onChange={(p, s) => { setPrimary(p); setSecondary(s); setError(null); }} />
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Field label="Note">
        <input className={inputClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. seat height 4" />
      </Field>
      <Button type="submit" variant="primary">{submitLabel}</Button>
    </form>
  );
}
