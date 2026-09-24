// Sound + vibration for the rest timer. AudioContext must be created/resumed
// inside a user gesture (iOS), so primeAudio() is called when a set is checked.
let ctx: AudioContext | undefined;

export function primeAudio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    /* audio unsupported */
  }
}

export function restFinishedAlert() {
  try {
    navigator.vibrate?.([200, 100, 200]);
  } catch {
    /* ignore */
  }
  if (!ctx) return;
  const t0 = ctx.currentTime;
  for (const [i, f] of [880, 880, 1320].entries()) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = f;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const start = t0 + i * 0.22;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
    osc.start(start);
    osc.stop(start + 0.2);
  }
}
