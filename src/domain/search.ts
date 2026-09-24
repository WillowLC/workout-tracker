import type { BodyPart, Equipment, Exercise } from './types';

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

function isSubsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (let j = 0; j < hay.length && i < needle.length; j++) if (hay[j] === needle[i]) i++;
  return i === needle.length;
}

/**
 * Score how well `query` matches `name` (0 = no match). Every query word must
 * match (any order): prefix of a word > substring > fuzzy subsequence of a word.
 */
export function matchScore(query: string, name: string): number {
  const q = norm(query);
  if (!q) return 1;
  const n = norm(name);
  const words = n.split(' ');
  let score = 0;
  for (const qw of q.split(' ')) {
    if (words.some((w) => w.startsWith(qw))) score += 3;
    else if (n.includes(qw)) score += 2;
    else if (qw.length >= 3 && words.some((w) => isSubsequence(qw, w))) score += 1;
    else return 0;
  }
  return score;
}

export interface ExerciseFilter {
  query: string;
  bodyParts: BodyPart[];
  equipment: Equipment[];
  includeArchived?: boolean;
}

export function filterExercises(list: Exercise[], f: ExerciseFilter): Exercise[] {
  const scored: [Exercise, number][] = [];
  for (const e of list) {
    if (e.archived && !f.includeArchived) continue;
    if (f.bodyParts.length && !f.bodyParts.includes(e.bodyPart)) continue;
    if (f.equipment.length && !f.equipment.includes(e.equipment)) continue;
    const s = matchScore(f.query, e.name);
    if (s > 0) scored.push([e, s]);
  }
  const hasQuery = !!norm(f.query);
  return scored
    .sort((a, b) => (hasQuery ? b[1] - a[1] : 0) || a[0].name.localeCompare(b[0].name))
    .map(([e]) => e);
}

/** Alphabetical sections by first letter. */
export function alphaSections(list: Exercise[]): [string, Exercise[]][] {
  const map = new Map<string, Exercise[]>();
  for (const e of [...list].sort((a, b) => a.name.localeCompare(b.name))) {
    const k = /[a-z]/i.test(e.name[0]) ? e.name[0].toUpperCase() : '#';
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(e);
  }
  return [...map.entries()];
}
