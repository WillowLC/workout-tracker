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
  it('every built-in exercise has photos, and other sources are credited', () => {
    expect(SEED_EXERCISES.filter((e) => !exerciseMedia(e.id)).map((e) => e.id)).toEqual([]);
    for (const id of MEDIA_EXERCISE_IDS) {
      for (const c of exerciseMedia(id)!.credits ?? []) {
        expect(c.author.length, id).toBeGreaterThan(1);
        expect(c.license, id).toMatch(/^(CC|Public domain)/);
        expect(c.source, id).toMatch(/^https:\/\//);
      }
    }
  });
  it('only references real exercises and every file exists', () => {
    expect(MEDIA_EXERCISE_IDS.filter((id) => !seedIds.has(id))).toEqual([]);
    for (const id of MEDIA_EXERCISE_IDS) {
      const m = exerciseMedia(id)!;
      expect(m.images.length, id).toBeGreaterThanOrEqual(1);
      expect(m.images.length, id).toBeLessThanOrEqual(2);
      for (const url of [...m.images, m.thumb]) expect(existsSync('public' + url.replace(/^\//, '/')), url).toBe(true);
    }
  });
});
