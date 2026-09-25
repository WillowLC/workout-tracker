// Export a DOM element (a recap card) as a PNG, fully offline.
import { dateStamp } from './files';

export async function shareElementAsPng(el: HTMLElement, name: string): Promise<'shared' | 'downloaded' | 'failed'> {
  try {
    const { toBlob } = await import('html-to-image');
    const bg = getComputedStyle(document.body).backgroundColor;
    const blob = await toBlob(el, { pixelRatio: 2, backgroundColor: bg, cacheBust: true });
    if (!blob) return 'failed';
    const filename = `${name}-${dateStamp()}.png`;
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Jim recap' });
        return 'shared';
      } catch (e) {
        if ((e as DOMException)?.name === 'AbortError') return 'shared';
      }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}
