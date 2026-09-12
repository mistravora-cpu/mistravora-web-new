"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";

type Stat = {
  value: string;
  label: string;
  suffix?: string;
  numericValue: number;
};


function AnimatedCounter({
  target,
  suffix = "",
  duration = 1500,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let started = false;
    let frameId = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            const start = performance.now();
            const animate = (now: number) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setCount(Math.round(target * eased));
              if (progress < 1) frameId = requestAnimationFrame(animate);
            };
            frameId = requestAnimationFrame(animate);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameId);
    };
  }, [target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export function StatsCounter({ stats }: { stats?: Stat[] }) {
  const data = stats ?? [];

  return (
    <section data-cv="auto" className="relative w-full overflow-hidden border-y border-border bg-surface section-py">
      {/* Subtle background */}
      <div aria-hidden className="absolute inset-0">
        <div className="aurora-bg absolute inset-0 opacity-30" />
      </div>

      <div className="relative w-full site-gutter">
        <ScrollReveal animation="fade-up" className="mb-12 flex flex-col items-center gap-2 text-center">
          <p className="eyebrow">
            By the numbers
          </p>
          <h2 className="max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
            Results that speak for themselves
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {data.map((stat, i) => (
            <ScrollReveal
              key={stat.label}
              animation="fade-up"
              delay={i * 80}
              className="flex flex-col items-center gap-2 text-center"
            >
              <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl tabular-nums">
                <AnimatedCounter target={stat.numericValue} suffix={stat.suffix} />
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
