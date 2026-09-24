import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SEED_EXERCISES } from '../seed';
import { EXERCISE_GUIDES } from './index';
import { MEDIA_EXERCISE_IDS, exerciseMedia } from '../exerciseMedia';

const seedIds = new Set(SEED_EXERCISES.map((e) => e.id));

describe('exercise guides', () => {
  it('every built-in exercise has a complete guide', () => {
    const missing = SEED_EXERCISES.filter((e) => !EXERCISE_GUIDES[e.id]).map((e) => e.id);
    expect(missing).toEqual([]);
    for (const [id, gd] of Object.entries(EXERCISE_GUIDES)) {
      expect(gd.steps.length, id).toBeGreaterThanOrEqual(3);
      expect(gd.cues.length, id).toBeGreaterThanOrEqual(1);
      expect(gd.mistakes.length, id).toBeGreaterThanOrEqual(1);
      for (const line of [...gd.steps, ...gd.cues, ...gd.mistakes]) expect(line.trim().length, id).toBeGreaterThan(5);
    }
  });
  it('guides only reference real exercises', () => {
    expect(Object.keys(EXERCISE_GUIDES).filter((id) => !seedIds.has(id))).toEqual([]);
  });
});

describe('exercise media', () => {
  it('only references real exercises and every file exists', () => {
    expect(MEDIA_EXERCISE_IDS.filter((id) => !seedIds.has(id))).toEqual([]);
    for (const id of MEDIA_EXERCISE_IDS) {
      const m = exerciseMedia(id)!;
      expect(m.images.length, id).toBe(2);
      for (const url of [...m.images, m.thumb]) expect(existsSync('public' + url.replace(/^\//, '/')), url).toBe(true);
    }
  });
});
