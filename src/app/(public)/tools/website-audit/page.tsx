import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";
import { AuditForm } from "./audit-form";

const baseMetadata: Metadata = withSocialMetadata({
  title: "Free Website Audit Tool",
  description:
    "Check your website's SEO, accessibility, performance and security best practices for free. Get clear scores and practical fixes from Mistravora in seconds.",
  alternates: { canonical: `${site.url}/tools/website-audit` },
});

export default function WebsiteAuditPage() {
  return (
    <section className="w-full site-gutter py-16">
      <PageHeader
        as="h1"
        title="Free Website Audit"
        description="Enter your website address to get SEO, accessibility, performance and best-practice scores with a clear list of what to fix. No email required."
      />
      <div className="mt-10">
        <AuditForm />
      </div>
    </section>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
