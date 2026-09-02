import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";
import { RoiCalculator } from "./roi-calculator";

export const metadata: Metadata = {
  title: "ROI Calculator",
  description:
    "Calculate how quickly a faster, better-converting website pays for itself — projected gains and payback period.",
  alternates: { canonical: `${site.url}/tools/roi-calculator` },
};

export default function RoiCalculatorPage() {
  return (
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <PageHeader
        as="h1"
        title="ROI Calculator"
        description="A better website isn't a cost — it's a growth lever. See the numbers for your business."
      />
      <div className="mt-12">
        <RoiCalculator />
      </div>
    </section>
  );
}
