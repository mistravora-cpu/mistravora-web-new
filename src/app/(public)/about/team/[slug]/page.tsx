import { jsonLd, withSocialMetadata } from "@/lib/seo";
import { applySeoOverrides } from "@/lib/seo-overrides";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Briefcase, MapPin } from "lucide-react";
import { getTeamMemberBySlug, memberSlug } from "@/lib/services";
import { site } from "@/lib/site";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  parseExpertise,
  safeUrl,
  memberInitials,
  categoryLabel,
  buildSocialLinks,
} from "@/lib/team";
import { getBusinessProfile } from "@/lib/business-profile";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) return { title: "Team member not found" };

  const url = `${site.url}/about/team/${memberSlug(member)}`;
  const description =
    member.bio ??
    `${member.name} is ${member.role} at ${site.name}.`;
  const photo = safeUrl(member.photo) ?? undefined;

  return applySeoOverrides(
    withSocialMetadata({
      title: `${member.name} — ${member.role}`,
      description,
      alternates: { canonical: url },
      openGraph: {
        type: "profile",
        url,
        title: `${member.name} — ${member.role}`,
        description,
        images: photo ? [{ url: photo, alt: `${member.name}, ${member.role}` }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${member.name} — ${member.role}`,
        description,
        images: photo ? [photo] : undefined,
      },
    })
  );
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [member, profile] = await Promise.all([
    getTeamMemberBySlug(slug),
    getBusinessProfile(),
  ]);
  if (!member) notFound();

  const initials = memberInitials(member.name);
  const expertise = parseExpertise(member.expertise);
  const socials = buildSocialLinks(member, profile.name);
  const photo = safeUrl(member.photo);
  const url = `${site.url}/about/team/${memberSlug(member)}`;
  const catLabel = categoryLabel(member.category);

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: member.name,
    jobTitle: member.role,
    description: member.bio ?? undefined,
    image: photo ?? undefined,
    url,
    worksFor: { "@type": "Organization", name: site.name, url: site.url },
    ...(member.department ? { department: member.department } : {}),
    ...(member.location ? { address: { "@type": "PostalAddress", addressLocality: member.location } } : {}),
    ...(socials.length > 0
      ? { sameAs: socials.filter((s) => s.external).map((s) => s.href) }
      : {}),
  };

  return (
    <article className="w-full site-gutter py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(personLd) }}
      />
      <div className="mx-auto w-full max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "About", href: "/about" },
            { label: member.name },
          ]}
        />

        <ScrollReveal animation="fade-up">
          <Button asChild variant="ghost" size="sm" className="mb-8">
            <Link href="/about">
              <ArrowLeft className="h-4 w-4" />
              Back to the team
            </Link>
          </Button>

          <div className="grid gap-10 md:grid-cols-[minmax(0,20rem)_1fr] lg:gap-14">
            {/* Portrait */}
            <div className="md:sticky md:top-24 md:self-start">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photo}
                    alt={`${member.name}, ${member.role} at ${profile.name}`}
                    width={640}
                    height={800}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 via-muted/40 to-transparent">
                    <span aria-hidden className="text-7xl font-semibold tracking-tighter text-primary/60 sm:text-8xl">
                      {initials}
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Portrait coming soon
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile content */}
            <div className="flex flex-col gap-6">
              <header className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
                    {catLabel}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {member.role}
                  </span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  {member.name}
                </h1>

                {(member.department || member.location) && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                    {member.department && (
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase aria-hidden className="h-4 w-4" />
                        {member.department}
                      </span>
                    )}
                    {member.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin aria-hidden className="h-4 w-4" />
                        {member.location}
                      </span>
                    )}
                  </div>
                )}
              </header>

              {member.bio && (
                <ScrollReveal animation="fade-up" delay={80}>
                  <section aria-label={`${member.name} bio`}>
                    <p className="text-base leading-8 text-foreground/90 sm:text-lg sm:leading-9">
                      {member.bio}
                    </p>
                  </section>
                </ScrollReveal>
              )}

              {expertise.length > 0 && (
                <ScrollReveal animation="fade-up" delay={140}>
                  <section aria-label={`${member.name} expertise`}>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Expertise
                    </h2>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {expertise.map((skill) => (
                        <li
                          key={skill}
                          className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </section>
                </ScrollReveal>
              )}

              {socials.length > 0 && (
                <ScrollReveal animation="fade-up" delay={200}>
                  <section aria-label={`${member.name} social profiles`}>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Connect
                    </h2>
                    <ul className="mt-3 flex flex-wrap gap-3">
                      {socials.map((s) => (
                        <li key={s.href}>
                          <a
                            href={s.href}
                            target={s.external ? "_blank" : undefined}
                            rel={s.external ? "noopener noreferrer" : undefined}
                            className="inline-flex items-center gap-2 rounded-lg border border-border/70 px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          >
                            <span className="flex h-5 w-5 items-center justify-center">
                              {s.icon}
                            </span>
                            <span>{s.platform}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                </ScrollReveal>
              )}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal animation="scale-in" delay={120} className="mt-16 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-lg font-semibold">Want to work with {member.name}?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us about your project — we&apos;ll match you with the right team.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/contact">
                Start a project
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/about">Meet the rest of the team</Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </article>
  );
}
