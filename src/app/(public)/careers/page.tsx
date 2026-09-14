import { getBusinessProfile } from "@/lib/business-profile";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { AnimatedHero } from "@/components/animated-hero";
import { ArticleBody } from "@/components/article-body";
import { PageFaqs } from "@/components/page-faqs";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { getIcon } from "@/lib/icon-map";
import { getHeroSection, getJobs, getBenefits } from "@/lib/services";

const baseMetadata: Metadata = withSocialMetadata({
  title: "Careers",
  description:
    "Explore current opportunities at Mistravora, a software and digital marketing company based in Sri Lanka and working with clients worldwide.",
  alternates: { canonical: `${site.url}/careers` },
});

export default async function CareersPage() {
  const [hero, profile, jobs, benefits] = await Promise.all([
    getHeroSection("careers"),
    getBusinessProfile(),
    getJobs(true),
    getBenefits(true),
  ]);
  return (
    <>
      <AnimatedHero hero={hero} page="careers" />
      <section className="w-full site-gutter py-16">
        <PageHeader
          title="Careers"
          description="Explore opportunities to work with the Mistravora team."
        />
        {jobs.length ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {jobs.map((job) => (
              <section
                key={job.id}
                className="min-w-0 rounded-xl border border-border bg-card p-6 sm:p-8"
              >
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {[job.type, job.location].filter(Boolean).join(" · ")}
                </p>
                {job.description && (
                  <div className="mt-5 text-sm leading-7">
                    <ArticleBody body={job.description} title={job.title} />
                  </div>
                )}
                <Button asChild className="mt-6">
                  <a
                    href={`mailto:${profile.email}?subject=${encodeURIComponent(
                      `Application: ${job.title}`,
                    )}`}
                  >
                    Apply for {job.title}
                  </a>
                </Button>
              </section>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <h2 className="text-lg font-semibold">No open roles right now</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              You can contact us about future opportunities and share your
              portfolio.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <a
                href={`mailto:${profile.email}?subject=Careers%20at%20Mistravora`}
              >
                Ask about future opportunities
              </a>
            </Button>
          </div>
        )}
        {!!benefits.length && (
          <section className="mt-14">
            <h2 className="text-2xl font-bold">Working at Mistravora</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {benefits.map((benefit) => {
                const Icon = getIcon(benefit.icon);
                return (
                  <div
                    key={benefit.id}
                    className="min-w-0 rounded-xl border border-border p-6"
                  >
                    <Icon aria-hidden className="h-6 w-6 text-primary" />
                    <h3 className="mt-4 text-lg font-semibold">
                      {benefit.title}
                    </h3>
                    <div className="mt-3 text-sm leading-7 text-muted-foreground">
                      <ArticleBody
                        body={benefit.description ?? ""}
                        title={benefit.title}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        <PageFaqs path="/careers" inset />
      </section>
    </>
  );
}
export async function generateMetadata() {
  return applySeoOverrides(baseMetadata);
}
