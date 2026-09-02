"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive gradient orbs that respond to mouse movement.
 * Adds a dynamic, premium feel to any section.
 * Respects prefers-reduced-motion.
 */
export function GradientOrbs({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const container = containerRef.current;
    if (!container) return;

    let rafId = 0;
    let targetX = 0.5;
    let targetY = 0.5;
    let currentX = 0.5;
    let currentY = 0.5;

    const handleMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width;
      targetY = (e.clientY - rect.top) / rect.height;
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (orb1Ref.current) {
        orb1Ref.current.style.transform = `translate(${currentX * 60}px, ${currentY * 40}px)`;
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.transform = `translate(${(1 - currentX) * -50}px, ${(1 - currentY) * -30}px)`;
      }
      if (orb3Ref.current) {
        orb3Ref.current.style.transform = `translate(${currentX * 30 - 15}px, ${(1 - currentY) * 20}px)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    container.addEventListener("mousemove", handleMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        ref={orb1Ref}
        className="absolute left-[10%] top-[15%] h-48 w-48 rounded-full bg-primary/15 blur-3xl transition-transform duration-300"
      />
      <div
        ref={orb2Ref}
        className="absolute right-[15%] top-[50%] h-56 w-56 rounded-full bg-accent/12 blur-3xl transition-transform duration-300"
      />
      <div
        ref={orb3Ref}
        className="absolute left-[50%] bottom-[10%] h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-transform duration-300"
      />
    </div>
  );
}
