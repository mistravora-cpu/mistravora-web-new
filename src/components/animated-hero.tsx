import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Info,
  LayoutGrid,
  DollarSign,
  Briefcase,
  FileText,
  Users,
  Mail,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HeroSection } from "@/lib/types";

const themes: Record<
  string,
  { glow: string; pattern: string; accent: string; icon: typeof Info }
> = {
  home: {
    glow: "bg-primary/20",
    pattern: "bg-grid",
    accent: "text-primary",
    icon: Sparkles,
  },
  about: {
    glow: "bg-accent/20",
    pattern: "bg-grid",
    accent: "text-accent",
    icon: Info,
  },
  solutions: {
    glow: "bg-primary/20",
    pattern: "bg-grid",
    accent: "text-primary",
    icon: LayoutGrid,
  },
  pricing: {
    glow: "bg-accent/20",
    pattern: "bg-grid",
    accent: "text-accent",
    icon: DollarSign,
  },
  blog: {
    glow: "bg-primary/15",
    pattern: "bg-grid",
    accent: "text-primary",
    icon: FileText,
  },
  "projects": {
    glow: "bg-accent/20",
    pattern: "bg-grid",
    accent: "text-accent",
    icon: Briefcase,
  },
  careers: {
    glow: "bg-primary/20",
    pattern: "bg-grid",
    accent: "text-primary",
    icon: Users,
  },
  contact: {
    glow: "bg-accent/20",
    pattern: "bg-grid",
    accent: "text-accent",
    icon: Mail,
  },
  tools: {
    glow: "bg-primary/20",
    pattern: "bg-grid",
    accent: "text-primary",
    icon: Wrench,
  },
};

export function AnimatedHero({
  hero,
  page,
}: {
  hero: HeroSection | null;
  page: string;
}) {
  const theme = themes[page] ?? themes.home;
  const ThemeIcon = theme.icon;

  const badge = hero?.badge;
  const headline = hero?.headline ?? "Mistravora";
  const highlighted = hero?.highlighted_text;
  const description = hero?.description;
  const primaryText = hero?.primary_button_text ?? "Get in touch";
  const primaryLink = hero?.primary_button_link ?? "/contact";
  const secondaryText = hero?.secondary_button_text;
  const secondaryLink = hero?.secondary_button_link;

  return (
    <section className="relative overflow-hidden" aria-label="Page hero">
      <div
        aria-hidden
        className={`absolute inset-0 ${theme.pattern} [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_72%)]`}
      />
      <div
        aria-hidden
        className="aurora-bg absolute inset-0"
      />
      <div
        aria-hidden
        className={`absolute -top-24 left-1/2 h-72 w-full max-w-xl -translate-x-1/2 rounded-full ${theme.glow} blur-2xl animate-pulse-soft`}
      />
      {/* Side accent orbs — gentle float */}
      <div
        aria-hidden
        className="absolute -left-16 top-1/3 h-40 w-40 rounded-full bg-primary/8 blur-2xl animate-float"
      />
      <div
        aria-hidden
        className="absolute -right-16 top-1/4 h-48 w-48 rounded-full bg-accent/8 blur-2xl animate-float"
        style={{ animationDelay: "-2.5s", animationDuration: "7s" }}
      />

      <div className="relative flex w-full flex-col items-center gap-5 px-4 pb-12 pt-10 text-center sm:gap-6 sm:px-8 sm:pb-16 sm:pt-12 lg:px-12">
        {/* Page icon with glow */}
        <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm animate-float sm:h-14 sm:w-14 ${theme.accent}`}>
          <ThemeIcon aria-hidden className="h-6 w-6 sm:h-7 sm:w-7" />
          <span className="absolute inset-0 -z-10 rounded-2xl bg-primary/10 opacity-0 blur-xl" />
        </div>

        {badge ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:border-primary/30">
            <Sparkles aria-hidden className={`h-3.5 w-3.5 ${theme.accent}`} />
            {badge}
          </span>
        ) : null}

        <h1 className="max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
          {headline}{" "}
          {highlighted ? (
            <span className="text-gradient">{highlighted}</span>
          ) : null}
        </h1>

        {description ? (
          <p className="max-w-xl text-sm leading-6 text-foreground/70 sm:text-lg sm:leading-8">
            {description}
          </p>
        ) : null}

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {primaryText && primaryLink !== "#form" ? (
            <Button size="lg" asChild className="w-full sm:w-auto">
              {primaryLink.startsWith("/") ? (
                <Link href={primaryLink}>
                  {primaryText}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              ) : (
                <a href={primaryLink} target="_blank" rel="noopener noreferrer">
                  {primaryText}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </a>
              )}
            </Button>
          ) : null}
          {secondaryText && secondaryLink && !secondaryLink.includes("wa.me") ? (
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto"
            >
              {secondaryLink.startsWith("/") ? (
                <Link href={secondaryLink}>{secondaryText}</Link>
              ) : (
                <a href={secondaryLink} target="_blank" rel="noopener noreferrer">
                  {secondaryText}
                </a>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
