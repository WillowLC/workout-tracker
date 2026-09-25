// PR celebration: a short confetti burst (canvas-confetti, bundled so it
// works offline). No vibration. Skipped entirely for reduced motion.
export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  } catch {
    return false;
  }
}

export function fireConfetti() {
  if (prefersReducedMotion()) return;
  void import('canvas-confetti')
    .then(({ default: confetti }) =>
      confetti({ particleCount: 90, spread: 75, startVelocity: 38, ticks: 140, origin: { y: 0.75 }, disableForReducedMotion: true, zIndex: 60 }),
    )
    .catch(() => {
      /* confetti is decoration only */
    });
}
