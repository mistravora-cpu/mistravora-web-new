/** Preserve the 60 Hz response while converging without overshoot on slow frames. */
export function smoothTowards(current: number, target: number, speed: number, delta: number) {
  const referenceAlpha = Math.min(1, Math.max(0, speed / 60));
  const alpha = 1 - Math.pow(1 - referenceAlpha, Math.max(0, delta) * 60);
  return current + (target - current) * alpha;
}

/** Robot positions are local to a scaled group; keep bounds in that same space. */
export function robotFrame(width: number, height: number, preferredScale = 1.2) {
  const scale = Math.max(0.001, Math.min(1.7, width / 2.5, height / 2.8) * preferredScale);
  const halfWidth = width / (2 * scale);
  const halfHeight = height / (2 * scale);
  // Includes the head, ears and space for rotation toward the camera.
  const xLimit = Math.max(0, halfWidth - 0.65);
  const lowerY = -halfHeight + 0.65;
  const upperY = halfHeight - 1.05;
  const centerY = Math.max(lowerY, Math.min(upperY, -0.2));
  return { scale, xLimit, lowerY, upperY, centerY };
}
