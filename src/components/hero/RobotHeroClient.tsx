"use client";

import type { HeroSection } from "@/lib/types";
import { useRef, useEffect, useState } from "react";
import { useBusinessProfile } from "@/components/business-profile-provider";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { estimatePath, resolveQuoteLink } from "@/lib/quote-links";
import styles from "./robot-hero.module.css";

// Load the 3D bundle after the headline paints; it starts automatically.
const RobotHero = dynamic(
  () => import("@/components/ui/robot-hero").then((m) => m.RobotHero),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-full w-full items-center justify-center"
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
      className={`${styles.hero} relative isolate w-full overflow-hidden`}
    >
      {/* One stationary backdrop joins the robot and copy without obscuring either. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_32%,rgba(0,153,190,0.10),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_50%_32%,rgba(0,180,210,0.16),transparent_65%)]"
      />

      {/* One scene sits beside the desktop copy and behind it on smaller screens. */}
      <div className={styles.scene} aria-hidden>
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

      {/* Company information and native links share the hero's pointer events. */}
      <div className={`${styles.content} relative z-10 flex min-w-0 flex-col items-center gap-4 site-gutter text-center sm:gap-5`}>
        {/* Badge */}
        <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-background/90 px-4 py-1.5 text-xs font-medium text-foreground/90">
          <Sparkles aria-hidden className="h-3.5 w-3.5 shrink-0 text-primary" />
          {hero?.badge ?? profile.tagline}
        </span>

        {/* H1 — primary SEO headline */}
        <h1 className="max-w-4xl text-balance text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl xl:text-[3.5rem]">
          {hero?.headline ?? profile.headline}{hero?.highlighted_text && <span className="text-primary"> {hero.highlighted_text}</span>}
        </h1>

        {/* Subheadline */}
        <div className="max-w-2xl text-pretty text-sm leading-7 text-foreground/85 sm:text-base sm:leading-7">
          {description ?? hero?.description ?? profile.intro}
        </div>

        {/* CTAs */}
        <div className="flex w-full max-w-sm flex-col justify-center gap-3 sm:w-auto sm:max-w-full sm:flex-row sm:flex-wrap">
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
            className="w-full bg-background/90 sm:w-auto"
          >
            <Link prefetch={false} href={resolveQuoteLink(hero?.secondary_button_link || "/assistant", hero?.secondary_button_text || "Ask our assistant")}>
              <Bot aria-hidden className="h-4 w-4" />
              {hero?.secondary_button_text || "Ask our assistant"}
            </Link>
          </Button>
        </div>

        {/* Trust signals */}
        <div className="mt-1 flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:text-sm">
          {profile.showHours !== "false" && profile.availability && <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {profile.availability}
          </span>}
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {profile.response}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {profile.industries}
          </span>
        </div>
      </div>

    </section>
  );
}
