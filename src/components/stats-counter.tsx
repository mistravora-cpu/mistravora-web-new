"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";

type Stat = {
  value: string;
  label: string;
  suffix?: string;
  numericValue: number;
};

const fallbackStats: Stat[] = [
  { value: "50+", label: "Projects Delivered", numericValue: 50, suffix: "+" },
  { value: "7", label: "Years Experience", numericValue: 7 },
  { value: "100%", label: "Client Satisfaction", numericValue: 100, suffix: "%" },
  { value: "24/7", label: "Support Available", numericValue: 24, suffix: "/7" },
];

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
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const animate = (now: number) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setCount(Math.round(target * eased));
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export function StatsCounter({ stats }: { stats?: Stat[] }) {
  const data = stats && stats.length > 0 ? stats : fallbackStats;

  return (
    <section data-cv="auto" className="relative w-full overflow-hidden border-y border-border bg-surface py-16 sm:py-20">
      {/* Animated background orbs */}
      <div aria-hidden className="absolute inset-0">
        <div className="aurora-bg animate-gradient-mesh absolute inset-0 opacity-40" />
        <div className="absolute left-[-10%] top-[20%] h-40 w-40 animate-float rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-5%] bottom-[10%] h-52 w-52 animate-float rounded-full bg-accent/10 blur-3xl" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-8 lg:px-12">
        <ScrollReveal animation="fade-up" className="mb-10 flex flex-col items-center gap-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            By the numbers
          </p>
          <h2 className="max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
            Results that speak for themselves
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {data.map((stat, i) => (
            <ScrollReveal
              key={stat.label}
              animation={i % 2 === 0 ? "scale-in" : "elastic"}
              delay={i * 100}
              className="group flex flex-col items-center gap-2 text-center"
            >
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-primary/5 blur-xl transition-opacity duration-500 group-hover:opacity-100 opacity-0"
                />
                <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  <AnimatedCounter target={stat.numericValue} suffix={stat.suffix} />
                </p>
              </div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
