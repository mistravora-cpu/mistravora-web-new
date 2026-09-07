import { getBusinessProfile } from "@/lib/business-profile";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import {
  ArrowRight,
  Zap,
  Globe,
  Mail,
  MapPin,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { AnimatedHero } from "@/components/animated-hero";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  LinkedinIcon,
  GithubIcon,
  InstagramIcon,
  FacebookIcon,
  XIcon,
} from "@/components/brand-icons";
import { getHeroSection, getCoreValues, getTeamMembers } from "@/lib/services";
import { getIcon as getMappedIcon } from "@/lib/icon-map";
import type { TeamMember } from "@/lib/types";

const baseMetadata: Metadata = withSocialMetadata({
  title: "About",
  description:
    "Mistravora is a Sri Lankan software company building fast, accessible, conversion-focused digital products.",
  alternates: { canonical: `${site.url}/about` },
});

function getIcon(name: string | null): LucideIcon {
  return getMappedIcon(name, Zap);
}

// ─── Team catalogue helpers ───────────────────────────────────────────────
// Canonical category order + display metadata. Categories that have no
// members are not rendered. Any unknown category value falls into a generic
// "Team" bucket shown last so legacy/unknown rows still appear.
type TeamCategoryMeta = {
  key: string;
  title: string;
  description: string;
};

const TEAM_CATEGORIES: TeamCategoryMeta[] = [
  { key: "senior", title: "Senior staff", description: "Leadership and senior engineers shaping Mistravora." },
  { key: "permanent", title: "Permanent staff", description: "The core team delivering every day." },
  { key: "advisor", title: "Advisors", description: "Trusted guides helping us steer the company." },
  { key: "contractor", title: "Contractors", description: "Specialist partners we work with." },
  { key: "intern", title: "Interns", description: "Rising talent growing with us." },
];

function groupTeamByCategory(members: TeamMember[]): { meta: TeamCategoryMeta; members: TeamMember[] }[] {
  const known = new Map<string, TeamMember[]>(TEAM_CATEGORIES.map((c) => [c.key, []]));
  const extras = new Map<string, TeamMember[]>();

  for (const m of members) {
    const key = (m.category || "").trim().toLowerCase();
    if (key && known.has(key)) {
      known.get(key)!.push(m);
    } else if (key) {
      const list = extras.get(key) ?? [];
      list.push(m);
      extras.set(key, list);
    } else {
      known.get("permanent")!.push(m);
    }
  }

  const groups: { meta: TeamCategoryMeta; members: TeamMember[] }[] = [];
  for (const meta of TEAM_CATEGORIES) {
    const list = known.get(meta.key) ?? [];
    if (list.length > 0) groups.push({ meta, members: list });
  }
  // Bucket any unknown categories under a generic, title-cased heading.
  for (const [key, list] of extras) {
    if (list.length === 0) continue;
    const title = key.charAt(0).toUpperCase() + key.slice(1);
    groups.push({ meta: { key, title, description: "Part of the wider Mistravora team." }, members: list });
  }
  return groups;
}

function parseExpertise(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

// Only treat values that start with http(s) as safe external links. Anything
// else (e.g. a bare handle) is dropped rather than risk a broken or unsafe
// navigation. Email is handled separately via mailto.
function safeUrl(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (v === "") return null;
  if (/^https?:\/\//i.test(v)) return v;
  return null;
}

function safeMailto(value: string | null): string | null {
  if (!value) return null;
  const v = value.trim();
  if (v === "") return null;
  // Basic email shape check.
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  return null;
}

function memberInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type SocialLink = {
  href: string;
  label: string;
  icon: ReactNode;
  external: boolean;
};

function buildSocialLinks(member: TeamMember, companyName: string): SocialLink[] {
  const links: SocialLink[] = [];
  const linkedin = safeUrl(member.linkedin);
  if (linkedin) links.push({ href: linkedin, label: `${member.name} on LinkedIn`, icon: <LinkedinIcon size={16} aria-hidden />, external: true });
  const x = safeUrl(member.x_handle);
  if (x) links.push({ href: x, label: `${member.name} on X`, icon: <XIcon size={14} aria-hidden />, external: true });
  const github = safeUrl(member.github);
  if (github) links.push({ href: github, label: `${member.name} on GitHub`, icon: <GithubIcon size={16} aria-hidden />, external: true });
  const instagram = safeUrl(member.instagram);
  if (instagram) links.push({ href: instagram, label: `${member.name} on Instagram`, icon: <InstagramIcon size={16} aria-hidden />, external: true });
  const facebook = safeUrl(member.facebook);
  if (facebook) links.push({ href: facebook, label: `${member.name} on Facebook`, icon: <FacebookIcon size={16} aria-hidden />, external: true });
  const website = safeUrl(member.website);
  if (website) links.push({ href: website, label: `${member.name} personal website`, icon: <Globe aria-hidden className="h-4 w-4" />, external: true });
  const mailto = safeMailto(member.email);
  if (mailto) links.push({ href: mailto, label: `Email ${member.name} at ${companyName}`, icon: <Mail aria-hidden className="h-4 w-4" />, external: false });
  return links;
}

export default async function AboutPage() {
  const [hero, profile] = await Promise.all([getHeroSection("about"), getBusinessProfile()]);
  const timeline = [{ year: profile.founded, title: "Founded", description: `${profile.name} was founded by ${profile.founder} and co-founded by ${profile.cofounder}.` }];
  const [dbValues, dbTeam] = await Promise.all([getCoreValues(true), getTeamMembers(true)]);
  const values = dbValues;
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
          <p>{profile.showHours !== "false" ? `${profile.availability}.` : ""} {profile.response}.</p>
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
        <div className="mx-auto w-full text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Who&apos;s building Mistravora
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Meet the people behind {profile.name}.
          </p>
        </div>

        {team.length === 0 ? (
          <ScrollReveal animation="fade-up" className="mx-auto mt-10 max-w-md rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Our team profiles are being updated. Please check back soon.
            </p>
          </ScrollReveal>
        ) : (
          <div className="mt-12 flex flex-col gap-16">
            {groupTeamByCategory(team).map((group, groupIndex) => {
              const groupDelayBase = groupIndex * 60;
              return (
                <section key={group.meta.key} aria-labelledby={`team-${group.meta.key}-heading`}>
                  <ScrollReveal animation="fade-up" delay={groupDelayBase} className="flex flex-col gap-2 border-l-2 border-primary/40 pl-5 sm:flex-row sm:items-end sm:justify-between sm:pl-6">
                    <div>
                      <h3 id={`team-${group.meta.key}-heading`} className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {group.meta.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {group.meta.description}
                      </p>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                      {group.members.length} {group.members.length === 1 ? "person" : "people"}
                    </p>
                  </ScrollReveal>

                  <div className="mt-8 grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {group.members.map((member, i) => {
                      const initials = memberInitials(member.name);
                      const expertise = parseExpertise(member.expertise);
                      const socials = buildSocialLinks(member, profile.name);
                      const photo = safeUrl(member.photo);
                      return (
                        <ScrollReveal
                          key={member.id}
                          animation="fade-up"
                          delay={Math.min(groupDelayBase + i * 90, 600)}
                          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
                        >
                          <figure>
                            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                              {photo ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={photo}
                                  alt={`${member.name}, ${member.role} at ${profile.name}`}
                                  width={640}
                                  height={800}
                                  loading="lazy"
                                  decoding="async"
                                  className="h-full w-full object-cover object-top motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
                                />
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/15 via-muted to-accent/10">
                                  <span aria-hidden className="text-7xl font-semibold tracking-tighter text-primary/70 sm:text-8xl">{initials}</span>
                                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Portrait coming soon</span>
                                </div>
                              )}
                              <span
                                aria-hidden
                                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/90 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                              />
                            </div>
                            <figcaption className="px-5 pb-1 pt-5 sm:px-6">
                              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                                {member.role}
                              </p>
                              <h4 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                                {member.name}
                              </h4>
                            </figcaption>
                          </figure>

                          <div className="flex flex-col gap-3 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              {member.department && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Briefcase aria-hidden className="h-3.5 w-3.5" />
                                  {member.department}
                                </span>
                              )}
                              {member.location && (
                                <span className="inline-flex items-center gap-1.5">
                                  <MapPin aria-hidden className="h-3.5 w-3.5" />
                                  {member.location}
                                </span>
                              )}
                            </div>

                            {member.bio && (
                              <p className="text-sm leading-6 text-muted-foreground">
                                {member.bio}
                              </p>
                            )}

                            {expertise.length > 0 && (
                              <ul className="flex flex-wrap gap-1.5" aria-label={`${member.name} expertise`}>
                                {expertise.map((skill) => (
                                  <li
                                    key={skill}
                                    className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                                  >
                                    {skill}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {socials.length > 0 ? (
                              <ul className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                                {socials.map((s) => (
                                  <li key={s.href}>
                                    <a
                                      href={s.href}
                                      target={s.external ? "_blank" : undefined}
                                      rel={s.external ? "noopener noreferrer" : undefined}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/60 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                                      aria-label={s.label}
                                    >
                                      {s.icon}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="mt-auto h-2" aria-hidden />
                            )}
                          </div>
                        </ScrollReveal>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
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
