import { describe, expect, it } from 'vitest';
import { defaultWeightSteps, effectiveStepKg, migrateSettings, roundToStep } from './weightSteps';
import { DEFAULT_SETTINGS } from './types';
import { kgToLb, lbToKg } from './units';

describe('weight steps', () => {
  it('kg defaults by equipment', () => {
    const s = defaultWeightSteps('kg');
    expect(s.Dumbbell).toBe(2);
    expect(s.Barbell).toBe(2.5);
    expect(s['Smith Machine']).toBe(2.5);
    expect(s.Machine).toBe(5);
    expect(s.Cable).toBe(5);
    expect(s.Kettlebell).toBe(4);
    for (const e of ['Other', 'Band', 'Bodyweight', 'Assisted'] as const) expect(s[e]).toBe(2.5);
  });
  it('lb defaults (stored in kg)', () => {
    const s = defaultWeightSteps('lb');
    expect(kgToLb(s.Dumbbell)).toBeCloseTo(5);
    expect(kgToLb(s.Barbell)).toBeCloseTo(5);
    expect(kgToLb(s['Smith Machine'])).toBeCloseTo(5);
    expect(kgToLb(s.Machine)).toBeCloseTo(10);
    expect(kgToLb(s.Cable)).toBeCloseTo(10);
    expect(kgToLb(s.Kettlebell)).toBeCloseTo(9);
  });
  it('effective step: exercise override ?? settings[equipment]', () => {
    expect(effectiveStepKg({ equipment: 'Machine' }, DEFAULT_SETTINGS)).toBe(5);
    expect(effectiveStepKg({ equipment: 'Machine', weightStepKg: 2.5 }, DEFAULT_SETTINGS)).toBe(2.5);
    expect(effectiveStepKg(undefined, DEFAULT_SETTINGS)).toBe(2.5);
    expect(effectiveStepKg({ equipment: 'Dumbbell' }, { weightStepsKg: { ...DEFAULT_SETTINGS.weightStepsKg, Dumbbell: 1 } })).toBe(1);
  });
  it('rounds to the step', () => {
    expect(roundToStep(76.3, 2.5)).toBe(77.5);
    expect(roundToStep(75, 2.5)).toBe(75);
    expect(roundToStep(13, 2)).toBe(14);
  });
});

describe('migrateSettings', () => {
  it('old default increment → default steps; other settings kept', () => {
    const s = migrateSettings({ unit: 'kg', countWarmupsInStats: true, showRpe: true, weightIncrementKg: 2.5, barWeightKg: 15 });
    expect(s.weightStepsKg).toEqual(defaultWeightSteps('kg'));
    expect(s).toMatchObject({ countWarmupsInStats: true, showRpe: true, barWeightKg: 15, progressionHints: true, celebrations: true, weeklySetTarget: { min: 10, max: 20 } });
    expect('weightIncrementKg' in s).toBe(false);
  });
  it('a changed increment becomes the Barbell and Smith Machine step', () => {
    const s = migrateSettings({ unit: 'kg', weightIncrementKg: 1.25 });
    expect(s.weightStepsKg.Barbell).toBe(1.25);
    expect(s.weightStepsKg['Smith Machine']).toBe(1.25);
    expect(s.weightStepsKg.Dumbbell).toBe(2);
  });
  it('lb users keep lb defaults unless they changed the increment', () => {
    expect(kgToLb(migrateSettings({ unit: 'lb', weightIncrementKg: lbToKg(5) }).weightStepsKg.Machine)).toBeCloseTo(10);
    expect(kgToLb(migrateSettings({ unit: 'lb', weightIncrementKg: lbToKg(2.5) }).weightStepsKg.Barbell)).toBeCloseTo(2.5);
  });
  it('empty or missing settings → defaults', () => {
    expect(migrateSettings(undefined)).toEqual(DEFAULT_SETTINGS);
  });
  it('already-migrated settings are unchanged', () => {
    const s = { ...DEFAULT_SETTINGS, weightStepsKg: { ...DEFAULT_SETTINGS.weightStepsKg, Cable: 2.5 }, currentGymId: 'g1' };
    expect(migrateSettings(s)).toEqual(s);
  });
});
