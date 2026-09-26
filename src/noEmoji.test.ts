// Jim must never show an emoji. This scans every source, data, markup and doc
// file so an emoji can't slip back in with a future change (CI runs this
// before every deploy). Use an SVG icon from components/icons.tsx instead.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EMOJI_RE, hasEmoji, stripEmoji } from './lib/noEmoji';

const ROOT = join(__dirname, '..');
const SCAN = ['src', 'public', 'scripts', 'docs', 'index.html', 'README.md', 'vite.config.ts'];
const TEXT = /\.(tsx?|jsx?|mjs|cjs|json|css|html|md|webmanifest|svg|txt)$/;

function files(p: string): string[] {
  const full = join(ROOT, p);
  if (statSync(full, { throwIfNoEntry: false }) === undefined) return [];
  if (statSync(full).isFile()) return TEXT.test(p) ? [full] : [];
  return readdirSync(full).flatMap((f) => files(join(p, f)));
}

describe('no emoji anywhere in Jim', () => {
  it('source, data and docs contain no emoji', () => {
    const hits: string[] = [];
    for (const f of SCAN.flatMap(files)) {
      readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
        const m = line.match(EMOJI_RE);
        if (m) hits.push(`${relative(ROOT, f)}:${i + 1}  ${m.join(' ')}`);
      });
    }
    expect(hits, `Emoji found. Use an icon from components/icons.tsx instead:\n${hits.join('\n')}`).toEqual([]);
  });

  it('detects and strips emoji, but keeps arrows and accents', () => {
    const trophy = String.fromCodePoint(0x1f3c6);
    const flex = String.fromCodePoint(0x1f4aa, 0x1f3fd);
    const heart = String.fromCodePoint(0x2764, 0xfe0f);
    expect(hasEmoji(`New PR ${trophy}`)).toBe(true);
    expect(stripEmoji(`New ${trophy} PR ${flex}${heart}`)).toBe('New PR ');
    for (const ok of ['↑ Try 82.5 kg', 'e1RM 90 → 95', 'SATS Nørrebro', '3 × 10', '½']) expect(hasEmoji(ok), ok).toBe(false);
  });
});
