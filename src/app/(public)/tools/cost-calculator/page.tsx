import { getRequirementConfig } from "@/lib/requirements/settings";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";
import { RequirementCalculator } from "@/components/requirements/calculator";

const baseMetadata: Metadata = withSocialMetadata({
  title: "Cost Calculator",
  description:
    "Describe your project, review a preliminary investment and delivery range, and request an emailed requirement summary and quotation PDF.",
  alternates: { canonical: `${site.url}/tools/cost-calculator` },
});

export default async function CostCalculatorPage() {
  const config = await getRequirementConfig();
  return (
    <section className="w-full site-gutter py-16">
      <PageHeader
        as="h1"
        title="Plan your project"
        description="Tell us what you need, build a clear requirement brief, and explore your estimated investment and delivery timeline."
      />
      <div className="mt-12">
        <RequirementCalculator config={config} />
      </div>
    </section>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
