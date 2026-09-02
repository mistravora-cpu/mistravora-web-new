"use client";

import { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// Lazy-load the 3D robot only when the hero is visible — defers the
// entire Three.js/R3F bundle download until needed.
const RobotHero = dynamic(
  () => import("@/components/ui/robot-hero").then((m) => m.RobotHero),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[75vh] min-h-[560px] w-full items-center justify-center"
        aria-hidden
      >
        <div className="h-10 w-10 animate-pulse rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    ),
  },
);

export function RobotHeroClient() {
  const sectionRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Defer 3D bundle download until after first paint is complete.
  // Strategy: wait for requestIdleCallback (or a 1.5s fallback) so the
  // HTML/CSS paints and the LCP element (h1) renders before the
  // multi-hundred-KB Three.js chunk starts downloading.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const trigger = () => setIsVisible(true);

    // Priority 1: use requestIdleCallback if available — fires when the
    // browser is idle after paint, minimizing main-thread contention.
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(trigger, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }

    // Priority 2: fallback to a double-RAF + setTimeout to ensure paint.
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(trigger, 800);
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Track cursor position and move the glow mask behind the text.
  // The robot follows the same cursor, so the glow stays aligned with it.
  useEffect(() => {
    const section = sectionRef.current;
    const glow = glowRef.current;
    if (!section || !glow) return;

    let rafId = 0;
    let targetX = 0.5; // normalized 0–1
    let targetY = 0.7; // biased toward bottom where text sits
    let currentX = 0.5;
    let currentY = 0.7;

    const handleMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width;
      targetY = (e.clientY - rect.top) / rect.height;
    };

    const animate = () => {
      // Smooth lerp toward cursor for fluid motion
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glow.style.transform = `translate(${currentX * 100}%, ${currentY * 100}%) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(animate);
    };

    section.addEventListener("mousemove", handleMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      section.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Mistravora hero — custom software and digital products"
      className="relative min-h-[560px] w-full overflow-hidden"
    >
      {/* 3D robot canvas — only mounts when hero is visible to defer
          the Three.js bundle download. */}
      <div className="absolute inset-0 z-0 h-[75vh]">
        {isVisible ? (
          <RobotHero />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            aria-hidden
          >
            <div className="h-10 w-10 animate-pulse rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        )}
      </div>

      {/* Cursor-tracking glow mask — moves with the robot to keep text readable */}
      <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
        <div
          ref={glowRef}
          className="absolute h-[400px] w-[600px] rounded-full opacity-60 blur-[80px]"
          style={{
            left: 0,
            top: 0,
            background:
              "radial-gradient(circle, hsl(var(--background) / 0.9) 0%, hsl(var(--background) / 0.5) 40%, transparent 70%)",
            transform: "translate(50%, 70%) translate(-50%, -50%)",
          }}
          aria-hidden
        />
      </div>

      {/* Company info — overlaid at the bottom of the canvas area.
          pointer-events-none lets mouse events pass through to the canvas
          below so the robot tracks the cursor across the entire hero.
          Interactive elements re-enable pointer-events-auto. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-4 px-4 pb-10 pt-4 text-center sm:gap-5 sm:px-8 sm:pb-14 lg:px-12">
        {/* Badge */}
        <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-1.5 text-xs font-medium text-foreground/90 backdrop-blur-sm transition-colors hover:border-primary/30">
          <Sparkles aria-hidden className="h-3.5 w-3.5 text-primary" />
          AI-powered software studio
        </span>

        {/* H1 — primary SEO headline */}
        <h1 className="max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] sm:text-4xl lg:text-5xl">
          We build{" "}
          <span className="text-gradient">intelligent software</span> that
          grows your business
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl text-sm leading-7 text-foreground/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] sm:text-base sm:leading-7">
          Mistravora crafts high-performance web platforms, custom dashboards,
          and AI-driven tools for ambitious companies in Sri Lanka and worldwide.
        </p>

        {/* CTAs */}
        <div className="pointer-events-auto flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/contact">
              Start your project
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full bg-card/95 backdrop-blur-sm sm:w-auto"
          >
            <Link href="/assistant">
              <Bot aria-hidden className="h-4 w-4" />
              Ask our AI
            </Link>
          </Button>
        </div>

        {/* Trust signals */}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-foreground/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            50+ projects delivered
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            1-business-day response
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Next.js &amp; Supabase experts
          </span>
        </div>
      </div>

      {/* Gradient fade — merges hero into the next section seamlessly */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-24 bg-gradient-to-b from-transparent to-background"
      />
    </section>
  );
}
