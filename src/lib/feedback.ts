/**
 * A short haptic tick (e.g. when a set is completed). Must be called from a
 * user gesture.
 * - Android / Chrome: the Vibration API.
 * - iOS (no Vibration API): toggling a native `<input type="checkbox" switch>`
 *   plays the system haptic on iOS 18+. Older iOS silently does nothing.
 */
export function haptic() {
  try {
    if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(12);
      return;
    }
    const label = document.createElement('label');
    label.setAttribute('aria-hidden', 'true');
    label.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.tabIndex = -1;
    label.appendChild(input);
    document.body.appendChild(label);
    label.click();
    label.remove();
  } catch {
    /* haptics unsupported */
  }
}
