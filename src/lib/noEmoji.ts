// Jim never shows emoji. Three layers keep it that way:
//  1. src/noEmoji.test.ts fails CI (and so blocks deploys) if an emoji enters the source.
//  2. installEmojiGuard() strips emoji from anything rendered at runtime, including
//     text the user typed or restored from a backup.
//  3. styles/index.css asks the browser for text (not colour-emoji) glyphs.

/** Pictographs, flags, keycaps, skin tones and the joiners/selectors that build emoji sequences. */
export const EMOJI_RE = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}\u{E0020}-\u{E007F}\u20E3\uFE0F]|\u200D(?=\p{Extended_Pictographic})/gu;

export function hasEmoji(s: string): boolean {
  EMOJI_RE.lastIndex = 0;
  return EMOJI_RE.test(s);
}

/** Remove emoji, and the double space that removing one mid-sentence leaves behind. */
export function stripEmoji(s: string): string {
  if (!hasEmoji(s)) return s;
  return s.replace(EMOJI_RE, '').replace(/ {2,}/g, ' ');
}

function cleanText(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const v = node.nodeValue ?? '';
    if (hasEmoji(v)) node.nodeValue = stripEmoji(v);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) cleanText(n);
  }
}

function cleanField(el: HTMLInputElement | HTMLTextAreaElement) {
  if (!hasEmoji(el.value)) return;
  el.value = stripEmoji(el.value);
  // Let React see the cleaned value.
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Watch the whole document and strip emoji from text and form fields as they appear. */
export function installEmojiGuard(root: Node = document.documentElement): () => void {
  cleanText(root);
  const obs = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'characterData') cleanText(r.target);
      else r.addedNodes.forEach(cleanText);
    }
    if (hasEmoji(document.title)) document.title = stripEmoji(document.title);
  });
  obs.observe(root, { subtree: true, childList: true, characterData: true });
  const onInput = (e: Event) => {
    const t = e.target;
    if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) cleanField(t);
  };
  document.addEventListener('input', onInput, true);
  return () => { obs.disconnect(); document.removeEventListener('input', onInput, true); };
}
