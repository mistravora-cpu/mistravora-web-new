import styles from "./about.module.css";
import { TechStack } from "@/components/tech-stack";
import { PageFaqs } from "@/components/page-faqs";
import { Testimonials } from "@/components/testimonials";
import { estimatePath } from "@/lib/quote-links";
import { TeamPortrait } from "@/components/team-portrait";
import { contentText } from "@/lib/content-preview";
import { ArticleBody } from "@/components/article-body";
import { getBusinessProfile } from "@/lib/business-profile";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { jsonLd, withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "@/components/content-image";
import Link from "next/link";
import { site } from "@/lib/site";
import {
  ArrowRight,
  ArrowUpRight,
  Zap,
  MapPin,
  Briefcase,
} from "lucide-react";
import { AnimatedHero } from "@/components/animated-hero";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getHeroSection, getCoreValues, getTeamMembers, memberSlug } from "@/lib/services";
import { getIcon as getMappedIcon } from "@/lib/icon-map";
import {
  groupTeamByCategory,
  parseExpertise,
  safeUrl,
  memberInitials,
  buildSocialLinks,
} from "@/lib/team";

const baseMetadata: Metadata = withSocialMetadata({
  title: "About",
  description:
    "Mistravora is a Sri Lankan software company building fast, accessible, conversion-focused digital products.",
  alternates: { canonical: `${site.url}/about` },
});

export default async function AboutPage() {
  const [hero, profile] = await Promise.all([getHeroSection("about"), getBusinessProfile()]);
  const [values, team] = await Promise.all([getCoreValues(true), getTeamMembers(true)]);

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${site.url}/about#page`,
      url: `${site.url}/about`,
      name: `About ${profile.name}`,
      description: profile.intro,
      about: { "@id": `${site.url}/#organization` },
      isPartOf: { "@id": `${site.url}/#website` },
      mainEntity: {
        "@type": "ItemList",
        name: `The ${profile.name} team`,
        itemListElement: team.map((member, index) => ({
          "@type": "ListItem", position: index + 1,
          item: { "@type": "Person", "@id": `${site.url}/about/team/${memberSlug(member)}#person`, name: member.name, jobTitle: member.role, url: `${site.url}/about/team/${memberSlug(member)}`, image: safeUrl(member.photo) ?? undefined },
        })),
      },
    }) }} />
    <AnimatedHero hero={hero} page="about" />
    <section className="w-full site-gutter py-16">

      <ScrollReveal animation="fade-up" className={styles.story} as="section">
        <div className="flex min-w-0 flex-col items-start gap-6">
          <div className="flex items-center gap-4">
            <Image src="/assets/mistravora-logo.svg" alt={`${profile.name} official logo`} width={64} height={64} className="h-16 w-16 object-contain" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The people. The purpose.</p>
          </div>
          <h2 className="max-w-xl text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl xl:text-5xl">
            {profile.name}: <span className="text-primary">{profile.headline}</span>
          </h2>
          <p className="max-w-lg text-pretty text-base leading-8 text-muted-foreground">{profile.industries} {profile.coverage}</p>
          <Link href="#our-team" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary">Meet our team <ArrowRight aria-hidden className="h-4 w-4" /></Link>
        </div>
        <div className="flex min-w-0 flex-col gap-6 text-sm leading-7 text-muted-foreground sm:text-base">
          <ArticleBody body={profile.story ?? ""} title="Company story" />
          <p>{profile.customers}</p>
          <dl className={styles.facts}>
            <div><dt className="text-xs font-semibold uppercase tracking-wider">Founded</dt><dd className="mt-2 text-xl font-semibold text-foreground">{profile.founded}</dd></div>
            <div><dt className="text-xs font-semibold uppercase tracking-wider">Led by</dt><dd className="mt-2 font-semibold text-foreground">{profile.founder} &amp; {profile.cofounder}</dd></div>
          </dl>
          <p className="border-l-2 border-primary/50 pl-4 text-sm">{profile.showHours !== "false" ? `${profile.availability}.` : ""} {profile.response}.</p>
        </div>
      </ScrollReveal>

      {/* Values */}
      {values.length > 0 && <section className="mt-16" aria-labelledby="about-values-heading">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our principles</p>
        <h2 id="about-values-heading" className="text-left text-3xl font-bold tracking-tight sm:text-4xl">
          What we stand for
        </h2>
        <div className="mt-8 grid w-full gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, i) => {
            const Icon = getMappedIcon(value.icon, Zap);
            return (
            <ScrollReveal key={value.id} animation="fade-up" delay={Math.min(i * 70, 280)} className={`${styles.value} group`}>
              <span aria-hidden className="absolute right-0 top-8 font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                <Icon aria-hidden className="h-5 w-5 text-primary" />
              </span>
              <h3 className="mt-4 font-semibold">{value.title}</h3>
              <div className="mt-2 text-sm leading-6 text-muted-foreground"><ArticleBody body={value.description ?? ""} title="Our values" /></div>
            </ScrollReveal>
            );
          })}
        </div>
      </section>}

      {/* Team */}
      <section id="our-team" aria-labelledby="our-team-heading" className={`${styles.team} scroll-mt-24`}>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Meet the team</p>
          <h2 id="our-team-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Who&apos;s building Mistravora
          </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
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

                  <div className="team-grid mt-12">
                    {group.members.map((member, i) => {
                      const initials = memberInitials(member.name);
                      const expertise = parseExpertise(member.expertise);
                      const socials = buildSocialLinks(member, profile.name);
                      const photo = safeUrl(member.photo);
                      const profileHref = `/about/team/${memberSlug(member)}`;
                      return (
                        <ScrollReveal
                          key={member.id}
                          animation="fade-up"
                          delay={Math.min(groupDelayBase + i * 90, 600)}
                          className="team-member group relative flex flex-col"
                        >
                          <figure className="relative aspect-[4/5] w-full">
                            {photo ? (
                              <TeamPortrait src={photo} name={member.name} role={member.role} company={profile.name} />
                            ) : (
                              <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 via-muted/40 to-transparent">
                                <span aria-hidden className="text-6xl font-semibold tracking-tighter text-primary/60 sm:text-7xl">{initials}</span>
                                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Portrait coming soon</span>
                              </div>
                            )}
                            <figcaption className="sr-only">{member.name} — {member.role} at {profile.name}</figcaption>
                          </figure>

                          <div className="team-member-content flex flex-1 flex-col gap-4 pt-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h4 className="text-2xl font-semibold leading-tight tracking-tight">
                                  <Link
                                    href={profileHref}
                                    className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                  >
                                    {member.name}
                                  </Link>
                                </h4>
                                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                                  {member.role}
                                </p>
                              </div>
                              <span aria-hidden className="team-profile-arrow -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground">
                                <ArrowUpRight className="h-5 w-5" />
                              </span>
                            </div>

                            {(member.department || member.location) && (
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
                            )}

                            {member.bio && (
                              <p className="line-clamp-4 text-sm leading-7 text-muted-foreground sm:text-base">
                                {contentText(member.bio, 280)}
                              </p>
                            )}

                            {expertise.length > 0 && (
                              <ul className="flex flex-wrap gap-1.5" aria-label={`${member.name} expertise`}>
                                {expertise.map((skill) => (
                                  <li
                                    key={skill}
                                    className="rounded-full border border-border/70 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                                  >
                                    {skill}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {socials.length > 0 && (
                              <ul className="relative z-10 mt-1 flex flex-wrap items-center gap-2">
                                {socials.map((s) => (
                                  <li key={s.href}>
                                    <a
                                      href={s.href}
                                      target={s.external ? "_blank" : undefined}
                                      rel={s.external ? "noopener noreferrer" : undefined}
                                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                      aria-label={s.label}
                                    >
                                      {s.icon}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <p className="mt-auto inline-flex min-h-11 items-center gap-2 pt-2 text-sm font-medium text-primary">
                              Read full profile
                              <ArrowRight aria-hidden className="h-3.5 w-3.5 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
                            </p>
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
      </section>

      {/* CTA */}
      <ScrollReveal animation="fade-up" className={`${styles.cta} relative mt-20 overflow-hidden rounded-2xl border border-border p-8 text-center sm:p-14`}>
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
              <Link href={estimatePath}>
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

    <Testimonials path="/about" />
    <PageFaqs path="/about" />
    <TechStack />
    </>
  );
}


export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
