/** Preserve the 60 Hz response while converging without overshoot on slow frames. */
export function smoothTowards(current: number, target: number, speed: number, delta: number) {
  const referenceAlpha = Math.min(1, Math.max(0, speed / 60));
  const alpha = 1 - Math.pow(1 - referenceAlpha, Math.max(0, delta) * 60);
  return current + (target - current) * alpha;
}
