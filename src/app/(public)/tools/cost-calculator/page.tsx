import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";
import { CostCalculator } from "./cost-calculator";

export const metadata: Metadata = {
  title: "Cost Calculator",
  description:
    "Estimate the cost of your website, e-commerce store, or web app in seconds — LKR or USD, with a WhatsApp quote hand-off.",
  alternates: { canonical: `${site.url}/tools/cost-calculator` },
};

export default function CostCalculatorPage() {
  return (
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <PageHeader
        as="h1"
        title="Cost Calculator"
        description="Pick your project type and features — get an instant estimate range. Final quotes are always confirmed after a free consultation."
      />
      <div className="mt-12">
        <CostCalculator />
      </div>
    </section>
  );
}
