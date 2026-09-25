import { describe, expect, it } from 'vitest';
import type { Template } from './types';
import { groupTemplatesByFolder, moveItem, renameFolderInfo, renumberTemplates, reorderFolders, setPlanDay, weekdayIndex } from './templates';
import { daysAgo } from '../lib/format';

const tpl = (id: string, name: string, folder?: string, order?: number): Template => ({ id, name, folder, order, exercises: [] });

describe('template ordering', () => {
  it('sorts by saved order, then name; unordered templates last', () => {
    const groups = groupTemplatesByFolder([tpl('a', 'A', 'PPL'), tpl('b', 'B', 'PPL', 1), tpl('c', 'C', 'PPL', 0), tpl('d', 'D')]);
    expect(groups.map(([f, l]) => [f, l.map((t) => t.id)])).toEqual([['', ['d']], ['PPL', ['c', 'b', 'a']]]);
  });

  it('orders folders by folder info, unfiled first', () => {
    const ts = [tpl('a', 'A', 'Alpha'), tpl('b', 'B', 'Beta'), tpl('c', 'C')];
    expect(groupTemplatesByFolder(ts).map(([f]) => f)).toEqual(['', 'Alpha', 'Beta']);
    const folders = reorderFolders([], ['Beta', 'Alpha']);
    expect(groupTemplatesByFolder(ts, folders).map(([f]) => f)).toEqual(['', 'Beta', 'Alpha']);
  });

  it('moves and renumbers, returning only changed templates', () => {
    const list = [tpl('a', 'A', undefined, 0), tpl('b', 'B', undefined, 1), tpl('c', 'C', undefined, 2)];
    const changed = renumberTemplates(moveItem(list, 2, 0));
    expect(changed.map((t) => [t.id, t.order])).toEqual([['c', 0], ['a', 1], ['b', 2]]);
    expect(renumberTemplates(list)).toEqual([]);
  });
});

describe('weekly plan', () => {
  it('sets a day, creating folder info when missing, and survives rename + reorder', () => {
    let f = setPlanDay([], 'PPL', 0, 't1');
    f = setPlanDay(f, 'PPL', 2, 't2');
    expect(f).toEqual([{ name: 'PPL', plan: ['t1', null, 't2', null, null, null, null] }]);
    f = renameFolderInfo(f, 'PPL', 'Split');
    f = reorderFolders(f, ['Other', 'Split']);
    expect(f.find((x) => x.name === 'Split')).toMatchObject({ order: 1, plan: ['t1', null, 't2', null, null, null, null] });
  });

  it('weekdayIndex is Monday-first', () => {
    expect(weekdayIndex(new Date(2026, 8, 21).getTime())).toBe(0); // Mon
    expect(weekdayIndex(new Date(2026, 8, 27).getTime())).toBe(6); // Sun
  });
});

describe('daysAgo', () => {
  const now = new Date(2026, 8, 25, 9, 0).getTime();
  it('counts calendar days', () => {
    expect(daysAgo(new Date(2026, 8, 25, 1, 0).getTime(), now)).toBe('Today');
    expect(daysAgo(new Date(2026, 8, 24, 23, 0).getTime(), now)).toBe('Yesterday');
    expect(daysAgo(new Date(2026, 7, 1).getTime(), now)).toBe('55 days ago');
  });
});
