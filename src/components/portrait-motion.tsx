"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Enhances the server-rendered image without React renders on pointer movement. */
export function PortraitMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const portrait = ref.current;
    if (!portrait) return;
    // Team profile links cover the card; listen on their shared parent so
    // the image interaction never blocks the link or touch scrolling.
    const surface = portrait.closest<HTMLElement>(".team-member") ?? portrait;
    const motion = matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    let frame = 0;
    let x = 0;
    let y = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      delete portrait.dataset.active;
      portrait.style.removeProperty("--portrait-rx");
      portrait.style.removeProperty("--portrait-ry");
      portrait.style.removeProperty("--portrait-x");
      portrait.style.removeProperty("--portrait-y");
    };
    const update = () => {
      frame = 0;
      const bounds = portrait.getBoundingClientRect();
      if (
        x < bounds.left ||
        x > bounds.right ||
        y < bounds.top ||
        y > bounds.bottom ||
        !bounds.width ||
        !bounds.height
      ) {
        reset();
        return;
      }
      const horizontal = ((x - bounds.left) / bounds.width) * 2 - 1;
      const vertical = ((y - bounds.top) / bounds.height) * 2 - 1;
      portrait.dataset.active = "true";
      portrait.style.setProperty("--portrait-rx", `${-vertical * 5}deg`);
      portrait.style.setProperty("--portrait-ry", `${horizontal * 7}deg`);
      portrait.style.setProperty("--portrait-x", `${horizontal * 9}px`);
      portrait.style.setProperty("--portrait-y", `${vertical * 7}px`);
    };
    const move = (event: PointerEvent) => {
      if (!motion.matches || event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    };
    surface.addEventListener("pointermove", move, { passive: true });
    surface.addEventListener("pointerleave", reset);
    surface.addEventListener("pointercancel", reset);
    motion.addEventListener("change", reset);
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", reset);
    return () => {
      reset();
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", reset);
      surface.removeEventListener("pointercancel", reset);
      motion.removeEventListener("change", reset);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", reset);
    };
  }, []);

  return (
    <div ref={ref} className="portrait-motion">
      <span aria-hidden className="portrait-halo" />
      <span aria-hidden className="portrait-orbit" />
      <div className="portrait-plane">{children}</div>
      <span aria-hidden className="portrait-light" />
    </div>
  );
}
