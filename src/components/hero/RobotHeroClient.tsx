"use client";

import type { HeroSection } from "@/lib/types";
import { useRef, useEffect, useState } from "react";
import { useBusinessProfile } from "@/components/business-profile-provider";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { estimatePath, resolveQuoteLink } from "@/lib/quote-links";

// Load the 3D bundle after the headline paints; it starts automatically.
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

export function RobotHeroClient({ hero, description }: { hero?: HeroSection | null; description?: React.ReactNode }) {
  const profile = useBusinessProfile();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Let the headline's fonts and layout finish before starting the 3D bundle.
  // Idle callbacks alone can run before that first content paint.
  useEffect(() => {
    let cancelled = false;
    let rafId = 0;
    let idleId: number | undefined;
    const afterFonts = () => {
      if (cancelled) return;
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
          if (cancelled) return;
          if (typeof requestIdleCallback === "function") {
            idleId = requestIdleCallback(() => setIsVisible(true), { timeout: 2000 });
          } else setIsVisible(true);
        });
      });
    };
    // Font loading errors settle this promise as well; the robot still starts
    // automatically with the browser's fallback font on every connection.
    void (document.fonts?.ready ?? Promise.resolve()).then(afterFonts, afterFonts);
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      if (idleId !== undefined) cancelIdleCallback(idleId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Mistravora hero — custom software and digital products"
      className="relative flex min-h-[max(560px,75svh)] w-full flex-col justify-end overflow-hidden"
    >
      {/* The shared hero event source keeps movement working over the text. */}
      <div className="absolute inset-0 z-0">
        {isVisible ? (
          <RobotHero eventSource={sectionRef} />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            aria-hidden
          >
            <div className="h-10 w-10 animate-pulse rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        )}
      </div>

      {/* A stationary fade keeps text readable without a flashing cursor trail. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(to bottom, transparent 25%, color-mix(in oklab, var(--background) 65%, transparent) 65%, var(--background) 100%)",
        }}
      />

      {/* Company information and native links share the hero's pointer events. */}
      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-4 site-gutter pb-12 pt-40 text-center sm:gap-5 sm:pb-16">
        {/* Badge */}
        <span className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-1.5 text-xs font-medium text-foreground/90 backdrop-blur-sm transition-colors hover:border-primary/30">
          <Sparkles aria-hidden className="h-3.5 w-3.5 text-primary" />
          {hero?.badge ?? profile.tagline}
        </span>

        {/* H1 — primary SEO headline */}
        <h1 className="max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] sm:text-4xl lg:text-5xl">
          {hero?.headline ?? profile.headline}{hero?.highlighted_text && <span className="text-primary"> {hero.highlighted_text}</span>}
        </h1>

        {/* Subheadline */}
        <div className="pointer-events-auto max-w-2xl text-sm leading-7 text-foreground/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] sm:text-base sm:leading-7">
          {description ?? hero?.description ?? profile.intro}
        </div>

        {/* CTAs */}
        <div className="pointer-events-auto flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link prefetch={false} href={resolveQuoteLink(hero?.primary_button_link || estimatePath, hero?.primary_button_text || "Start your project")}>
              {hero?.primary_button_text || "Start your project"}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="w-full bg-card/95 backdrop-blur-sm sm:w-auto"
          >
            <Link prefetch={false} href={resolveQuoteLink(hero?.secondary_button_link || "/assistant", hero?.secondary_button_text || "Ask our assistant")}>
              <Bot aria-hidden className="h-4 w-4" />
              {hero?.secondary_button_text || "Ask our assistant"}
            </Link>
          </Button>
        </div>

        {/* Trust signals */}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-foreground/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] sm:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {profile.showHours !== "false" ? profile.availability : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {profile.response}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {profile.industries}
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
