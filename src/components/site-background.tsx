/**
 * SiteBackground — lightweight static background.
 * No animations, zero main-thread cost, maximum performance.
 */
export function SiteBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent"
    />
  );
}
