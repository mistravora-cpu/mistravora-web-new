import { Code2, PenTool, Rocket, Search } from "lucide-react";
import { ScrollReveal } from "@/components/scroll-reveal";

const steps = [
  {
    icon: Search,
    title: "Discover",
    description:
      "A free call to understand your goals, audience, and budget. You get honest advice — even if that means you don't need us yet.",
  },
  {
    icon: PenTool,
    title: "Design",
    description:
      "Wireframes and a visual direction within days. You review, we refine — no surprises at the end.",
  },
  {
    icon: Code2,
    title: "Build",
    description:
      "Weekly progress previews on a live staging link. Performance budgets enforced from the first commit.",
  },
  {
    icon: Rocket,
    title: "Launch & grow",
    description:
      "Deployment, analytics, SEO checks — then optional care plans to keep improving every month.",
  },
] as const;

export function Process() {
  return (
    <section className="relative w-full overflow-hidden site-gutter section-py">
      {/* Subtle background grid */}
      <div aria-hidden className="bg-grid absolute inset-0 opacity-[0.03]" />

      <div className="relative flex flex-col items-center gap-3 text-center">
        <p className="eyebrow">
          How we work
        </p>
        <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
          From idea to <span className="text-gradient">launch</span> in four steps
        </h2>
      </div>

      <ol className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Connecting line — hidden on mobile, visible on lg */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
        />

        {steps.map((step, index) => (
          <ScrollReveal
            key={step.title}
            animation="fade-up"
            delay={index * 100}
            as="li"
            className="group interactive-card hover:-translate-y-0.5 relative overflow-hidden p-6"
          >
            <span
              aria-hidden
              className="absolute right-4 top-3 text-5xl font-bold text-muted/60 transition-colors group-hover:text-primary/15"
            >
              {index + 1}
            </span>
            <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
              <step.icon aria-hidden className="h-5 w-5 text-primary" />
            </span>
            <h3 className="relative mt-4 font-semibold tracking-tight">{step.title}</h3>
            <p className="relative mt-2 text-sm leading-6 text-muted-foreground">
              {step.description}
            </p>
            {/* Progress bar at bottom */}
            <div
              aria-hidden
              className="absolute bottom-0 left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full"
            />
          </ScrollReveal>
        ))}
      </ol>
    </section>
  );
}
