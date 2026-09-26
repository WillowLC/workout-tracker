import { describe, expect, it } from 'vitest';
import type { FolderInfo, Template, Workout } from './types';
import { currentFolder, cycleSlots, folderMode, suggestForFolder, whenLabel } from './schedule';

const tpl = (id: string, folder = 'PPL'): Template => ({ id, name: id, folder, exercises: [] });
const at = (day: number, hour = 18) => new Date(2026, 8, day, hour).getTime(); // September 2026; the 21st is a Monday
const done = (templateId: string, day: number): Workout => ({ id: `${templateId}-${day}`, name: templateId, startedAt: at(day), finishedAt: at(day, 19), exercises: [], templateId });

const ppl = [tpl('push'), tpl('pull'), tpl('legs')];
const cycle: FolderInfo = { name: 'PPL', mode: 'cycle', cycle: ['push', 'pull', 'legs', null] };

describe('folder mode', () => {
  it('defaults to weekly only when a weekly plan exists', () => {
    expect(folderMode(undefined)).toBe('cycle');
    expect(folderMode({ name: 'x', plan: [null, 'a', null, null, null, null, null] })).toBe('weekly');
    expect(folderMode({ name: 'x', mode: 'cycle', plan: ['a'] })).toBe('cycle');
  });

  it('cycle defaults to template order and drops deleted templates', () => {
    expect(cycleSlots(undefined, ppl)).toEqual(['push', 'pull', 'legs']);
    expect(cycleSlots({ name: 'PPL', cycle: ['push', 'gone', null, 'legs'] }, ppl)).toEqual(['push', null, 'legs']);
  });
});

describe('cycle suggestions', () => {
  it('starts at the first workout with no history', () => {
    expect(suggestForFolder('PPL', cycle, ppl, [], at(22))).toMatchObject({ templateId: 'push', doneToday: false, next: { templateId: 'pull', inDays: 1 } });
  });

  it('follows the cycle day by day, with the rest day after legs', () => {
    const h = [done('push', 21), done('pull', 22), done('legs', 23)];
    expect(suggestForFolder('PPL', cycle, ppl, h.slice(0, 1), at(22))).toMatchObject({ templateId: 'pull' });
    expect(suggestForFolder('PPL', cycle, ppl, h, at(23))).toMatchObject({ templateId: 'legs', doneToday: true, next: { templateId: 'push', inDays: 2 } });
    expect(suggestForFolder('PPL', cycle, ppl, h, at(24))).toMatchObject({ templateId: undefined, next: { templateId: 'push', inDays: 1 } });
    expect(suggestForFolder('PPL', cycle, ppl, h, at(25))?.templateId).toBe('push');
  });

  it('never skips a workout when days are missed', () => {
    expect(suggestForFolder('PPL', cycle, ppl, [done('push', 21)], at(26))?.templateId).toBe('pull');
  });

  it('follows what you actually did, even out of order', () => {
    expect(suggestForFolder('PPL', cycle, ppl, [done('push', 21), done('legs', 22)], at(23))?.templateId).toBeUndefined(); // rest after legs
    expect(suggestForFolder('PPL', cycle, ppl, [done('push', 21), done('legs', 22)], at(24))?.templateId).toBe('push');
  });

  it('handles a template that appears twice (e.g. upper/lower/upper)', () => {
    const ul: FolderInfo = { name: 'UL', mode: 'cycle', cycle: ['up', 'low', null, 'up', 'low', null, null] };
    const list = [tpl('up', 'UL'), tpl('low', 'UL')];
    const h = [done('up', 21), done('low', 22), done('up', 24), done('low', 25)];
    expect(suggestForFolder('UL', ul, list, h, at(26))).toMatchObject({ templateId: undefined, slot: 5 });
    expect(suggestForFolder('UL', ul, list, h, at(27))).toMatchObject({ templateId: undefined, slot: 6 });
    expect(suggestForFolder('UL', ul, list, h, at(28))).toMatchObject({ templateId: 'up', slot: 0 });
  });
});

describe('weekly suggestions', () => {
  const weekly: FolderInfo = { name: 'PPL', plan: ['push', null, 'pull', null, 'legs', null, null] };
  it('uses the weekday and finds the next planned day', () => {
    expect(suggestForFolder('PPL', weekly, ppl, [], at(21))).toMatchObject({ mode: 'weekly', templateId: 'push', next: { templateId: 'pull', inDays: 2 } });
    expect(suggestForFolder('PPL', weekly, ppl, [], at(26))).toMatchObject({ templateId: undefined, next: { templateId: 'push', inDays: 2 } });
    expect(suggestForFolder('PPL', weekly, ppl, [done('push', 21)], at(21))?.doneToday).toBe(true);
  });
});

describe('current folder', () => {
  const groups: [string, Template[]][] = [['', [tpl('solo', '')]], ['A', [tpl('a1', 'A')]], ['B', [tpl('b1', 'B')]]];
  it('is the folder of the latest template workout', () => {
    expect(currentFolder(groups, [], [done('a1', 21), done('b1', 22)])).toBe('B');
    expect(currentFolder(groups, [], [done('b1', 21), done('a1', 22)])).toBe('A');
  });
  it('falls back to a planned folder, then the first folder', () => {
    expect(currentFolder(groups, [{ name: 'B', plan: ['b1'] }], [])).toBe('B');
    expect(currentFolder(groups, [], [])).toBe('A');
  });
});

it('labels when the next workout is', () => {
  expect(whenLabel(1, at(21))).toBe('Tomorrow');
  expect(whenLabel(3, at(21))).toBe('Thursday');
  expect(whenLabel(9, at(21))).toBe('in 9 days');
});
