import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import {
  ArrowRight,
  Zap,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { AnimatedHero } from "@/components/animated-hero";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getHeroSection, getCoreValues, getTeamMembers } from "@/lib/services";
import { getIcon as getMappedIcon } from "@/lib/icon-map";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mistravora is a Sri Lankan software company building fast, accessible, conversion-focused digital products.",
  alternates: { canonical: `${site.url}/about` },
};

function getIcon(name: string | null): LucideIcon {
  return getMappedIcon(name, Zap);
}

const fallbackValues = [
  {
    id: "fallback-v1",
    icon: "Zap",
    title: "Performance-first",
    description:
      "Every build ships with strict budgets for speed, bundle size, and accessibility — because slow sites lose customers.",
    sort_order: 1,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-v2",
    icon: "Shield",
    title: "Privacy-first",
    description:
      "Consent-aware analytics and no tracker pile-ups. Your visitors' data is treated with respect.",
    sort_order: 2,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-v3",
    icon: "HandHeart",
    title: "Built to convert",
    description:
      "Design, copy, and tooling focused on one goal: turning visitors into conversations and customers.",
    sort_order: 3,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-v4",
    icon: "Lightbulb",
    title: "Honest advice",
    description:
      "We recommend the simplest thing that works — not the most expensive. If you don't need it, we'll say so.",
    sort_order: 4,
    published: true,
    created_at: "",
    updated_at: "",
  },
];

const fallbackTeam = [
  {
    id: "fallback-t1",
    name: "Founder & Lead Engineer",
    role: "Founder & Lead Engineer",
    bio: "Architecture, performance, and delivery — and the person you'll actually talk to about your project.",
    photo: null,
    linkedin: null,
    x_handle: null,
    sort_order: 1,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-t2",
    name: "Product Design",
    role: "Product Design",
    bio: "Interfaces that feel effortless — designed thumb-first for real phones, not portfolio screenshots.",
    photo: null,
    linkedin: null,
    x_handle: null,
    sort_order: 2,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-t3",
    name: "AI & Automation",
    role: "AI & Automation",
    bio: "Chat assistants, smart features, and workflows that quietly save your team hours every week.",
    photo: null,
    linkedin: null,
    x_handle: null,
    sort_order: 3,
    published: true,
    created_at: "",
    updated_at: "",
  },
];

const timeline = [
  {
    year: "2025",
    title: "The frustration",
    description:
      "We watched Sri Lankan businesses pay agency prices for slow, template websites that never converted. We knew it could be done better — and cheaper.",
  },
  {
    year: "2025",
    title: "First launches",
    description:
      "Our first builds went live: fast, honest, engineered with performance budgets. They outperformed sites that cost five times more.",
  },
  {
    year: "2026",
    title: "Mistravora today",
    description:
      "A full digital platform practice — websites, web apps, and AI features — engineered in Paragahadeniya, Kurunegala, serving clients everywhere.",
  },
] as const;

export default async function AboutPage() {
  const hero = await getHeroSection("about");
  const [dbValues, dbTeam] = await Promise.all([getCoreValues(true), getTeamMembers(true)]);
  const values = dbValues.length > 0 ? dbValues : fallbackValues;
  const team = dbTeam.length > 0 ? dbTeam : fallbackTeam;

  return (
    <>
    <AnimatedHero hero={hero} page="about" />
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">

      <div className="mt-10 flex animate-fade-in-up justify-center">
        <Image
          src="/mistravoralogo.svg"
          alt="Mistravora logo"
          width={96}
          height={96}
          className="animate-float rounded-full"
        />
      </div>

      {/* Story */}
      <ScrollReveal animation="slide-left" className="mt-16 grid w-full gap-8 lg:grid-cols-2">
        <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          From Kurunegala to{" "}
          <span className="gradient-text-flow">the world</span>
        </h2>
        <div className="flex flex-col gap-4 text-sm leading-7 text-muted-foreground sm:text-base">
          <p>
            Mistravora started with a simple observation: businesses across Sri
            Lanka were paying big-agency prices for websites that loaded
            slowly, looked generic, and never turned visitors into customers.
            The problem wasn&apos;t budget — it was how the work was done.
          </p>
          <p>
            So we built a studio around a different idea: engineering-first
            websites with strict performance budgets, honest pricing in LKR,
            and direct access to the people actually doing the work. No account
            managers, no telephone games, no surprise invoices.
          </p>
          <p>
            Today we ship everything from marketing sites to full web platforms
            and AI-powered features — for clients in Sri Lanka and around the
            world. The tools on this very site? We built those too.
          </p>
        </div>
      </ScrollReveal>

      {/* Timeline */}
      <div className="mt-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          The journey so far
        </h2>
        <ol className="mx-auto mt-10 flex max-w-3xl flex-col gap-0">
          {timeline.map((milestone, index) => (
            <ScrollReveal key={milestone.title} animation="clip-reveal" delay={index * 120} className="relative flex gap-6 border-l-2 border-border pb-10 pl-8 last:pb-0">
              <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-primary/20" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {milestone.year}
                </p>
                <h3 className="mt-1 font-semibold">{milestone.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {milestone.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </ol>
      </div>

      {/* Values */}
      <div className="mt-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          What we stand for
        </h2>
        <div className="mt-10 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, i) => {
            const Icon = getIcon(value.icon);
            return (
            <ScrollReveal key={value.id} animation={i % 2 === 0 ? "elastic" : "flip-in"} delay={i * 80} className="shine-sweep hover-lift group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Icon aria-hidden className="h-5 w-5 text-primary" />
              </span>
              <h3 className="mt-4 font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {value.description}
              </p>
            </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Team */}
      <div className="mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Who&apos;s building Mistravora
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            A small, senior team. No hand-offs, no layers — you talk directly
            to the people who design and build your product.
          </p>
        </div>
        <div className="mt-10 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => {
            const initials = member.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
            return (
              <ScrollReveal key={member.id} animation={i % 3 === 0 ? "flip-in" : i % 3 === 1 ? "elastic" : "rotate-in"} delay={i * 100} className="glass-card gradient-border-card group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl p-6 text-center transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10">
                {/* Decorative gradient orb */}
                <div aria-hidden className="absolute -top-8 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:bg-primary/20" />

                {/* Avatar with gradient ring */}
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 opacity-60 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
                  {member.photo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="relative h-16 w-16 rounded-full object-cover ring-2 ring-background transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-lg font-bold text-primary-foreground ring-2 ring-background transition-transform duration-300 group-hover:scale-105">
                      {initials}
                    </span>
                  )}
                </div>

                <h3 className="relative font-bold tracking-tight">{member.name}</h3>
                <p className="relative text-xs font-semibold uppercase tracking-wider text-primary">{member.role}</p>
                <p className="relative text-sm leading-6 text-muted-foreground">
                  {member.bio}
                </p>

                {/* Social links */}
                {(member.linkedin || member.x_handle) && (
                  <div className="relative mt-1 flex items-center gap-2">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                        aria-label={`${member.name} on LinkedIn`}
                      >
                        <Share2 aria-hidden className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {member.x_handle && (
                      <a
                        href={member.x_handle}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
                        aria-label={`${member.name} on X`}
                      >
                        <span className="text-xs font-bold">X</span>
                      </a>
                    )}
                  </div>
                )}
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <ScrollReveal animation="scale-in" className="relative mt-20 overflow-hidden rounded-2xl border border-border bg-card p-8 text-center sm:p-14">
        <div
          aria-hidden
          className="absolute -top-20 left-1/2 h-56 w-full max-w-lg -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="relative flex flex-col items-center gap-5">
          <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
            Want to build the next chapter with us?
          </h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            Whether it&apos;s a project or a career — the conversation starts
            the same way.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/contact">
                Start a project
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto"
            >
              <Link href="/careers">Join the team</Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </section>

    {/* Referral program */}
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <ScrollReveal animation="scale-in" className="mx-auto max-w-2xl rounded-2xl border border-border bg-gradient-to-br from-card/80 to-card/40 p-8 text-center backdrop-blur-md">
        <div
          aria-hidden
          className="absolute -top-12 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
        />
        <h2 className="relative text-2xl font-bold tracking-tight">
          Refer a business, earn 10% off
        </h2>
        <p className="relative mt-3 text-sm leading-6 text-muted-foreground">
          Know someone who needs a website or software? Send them our way. If they
          become a client, you get 10% off your next project — or a LKR 10,000
          referral bonus. No limits.
        </p>
        <Button asChild className="relative mt-6">
          <Link href="/contact">
            Refer a business
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </Button>
      </ScrollReveal>
    </section>
    </>
  );
}

