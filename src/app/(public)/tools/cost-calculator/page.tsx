import { getCalculatorConfig } from "@/lib/calculator-settings";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";
import { CostCalculator } from "./cost-calculator";

const baseMetadata: Metadata = withSocialMetadata({
  title: "Cost Calculator",
  description:
    "Estimate the cost of your website, e-commerce store, or web app in seconds — LKR or USD, with a WhatsApp quote hand-off.",
  alternates: { canonical: `${site.url}/tools/cost-calculator` },
});

export default async function CostCalculatorPage() {
  const config = await getCalculatorConfig();
  return (
    <section className="w-full site-gutter py-16">
      <PageHeader
        as="h1"
        title="Cost Calculator"
        description="Pick your project type and features — get an instant estimate range. Final quotes are always confirmed after a free consultation."
      />
      <div className="mt-12">
        <CostCalculator config={config} />
      </div>
    </section>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
