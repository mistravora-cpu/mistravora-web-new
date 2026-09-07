import { getBusinessProfile } from "@/lib/business-profile";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
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

const baseMetadata: Metadata = withSocialMetadata({
  title: "About",
  description:
    "Mistravora is a Sri Lankan software company building fast, accessible, conversion-focused digital products.",
  alternates: { canonical: `${site.url}/about` },
});

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

export default async function AboutPage() {
  const [hero, profile] = await Promise.all([getHeroSection("about"), getBusinessProfile()]);
  const timeline = [{ year: profile.founded, title: "Founded", description: `${profile.name} was founded by ${profile.founder} and co-founded by ${profile.cofounder}.` }];
  const [dbValues, dbTeam] = await Promise.all([getCoreValues(true), getTeamMembers(true)]);
  const values = dbValues.length > 0 ? dbValues : fallbackValues;
  const team = dbTeam;

  return (
    <>
    <AnimatedHero hero={hero} page="about" />
    <section className="w-full site-gutter py-16">

      <div className="mt-10 flex animate-fade-in-up justify-center">
        <Image
          src="/assets/mistravora-logo.svg"
          alt="Mistravora official company logo"
          title="Mistravora"
          width={96}
          height={96}
          className="animate-float rounded-full"
        />
      </div>

      {/* Story */}
      <ScrollReveal animation="slide-left" className="mt-16 grid w-full gap-8 lg:grid-cols-2">
        <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {profile.name}: <span className="gradient-text-flow">{profile.headline}</span>
        </h2>
        <div className="flex flex-col gap-4 text-sm leading-7 text-muted-foreground sm:text-base">
          <p>{profile.story}</p>
          <p>{profile.customers}</p>
          <p>{profile.industries} {profile.coverage}</p>
          <p>{profile.availability}. {profile.response}.</p>
        </div>
      </ScrollReveal>

      {/* Timeline */}
      <div className="mt-20">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          The journey so far
        </h2>
        <ol className="mx-auto mt-10 flex  w-full flex-col gap-0">
          {timeline.map((milestone, index) => (
            <li key={milestone.title}><ScrollReveal animation="clip-reveal" delay={index * 120} className="relative flex gap-6 border-l-2 border-border pb-10 pl-8 last:pb-0">
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
            </ScrollReveal></li>
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
        <div className="mx-auto  w-full text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Who&apos;s building Mistravora
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Meet the people behind Mistravora.
          </p>
        </div>
        <div className="mx-auto mt-10 grid w-full  gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, i) => {
            const initials = member.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
            return (
              <ScrollReveal key={member.id} animation={i % 3 === 0 ? "flip-in" : i % 3 === 1 ? "elastic" : "rotate-in"} delay={i * 100} className="glass-card gradient-border-card group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl p-6 text-center transition-all hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10">
                {/* Decorative gradient orb */}
                <div aria-hidden className="absolute -top-8 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:bg-primary/20" />

                {/* Avatar with gradient ring */}
                <div className="relative">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/30 opacity-60 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
                  {member.photo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={member.photo}
                      alt={member.name}
                      width={224}
                      height={224}
                      loading="lazy"
                      decoding="async"
                      className="relative h-44 w-44 rounded-2xl object-cover object-top ring-2 ring-background motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105 sm:h-56 sm:w-56"
                    />
                  ) : (
                    <span className="relative flex h-44 w-44 items-center justify-center rounded-2xl sm:h-56 sm:w-56 bg-gradient-to-br from-primary to-primary/60 text-lg font-bold text-primary-foreground ring-2 ring-background transition-transform duration-300 group-hover:scale-105">
                      {initials}
                    </span>
                  )}
                </div>

                <h3 className="relative text-xl font-bold tracking-tight">{member.name}</h3>
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

    </>
  );
}


export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
