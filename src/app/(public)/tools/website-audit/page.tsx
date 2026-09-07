import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";
import { AuditForm } from "./audit-form";

const baseMetadata: Metadata = withSocialMetadata({
  title: "AI Website Audit",
  description:
    "Get a free performance, accessibility, and SEO score for your website in seconds — powered by Google Lighthouse.",
  alternates: { canonical: `${site.url}/tools/website-audit` },
});

export default function WebsiteAuditPage() {
  return (
    <section className="w-full site-gutter py-16">
      <PageHeader
        as="h1"
        title="AI Website Audit"
        description="Enter your site's URL and email — get instant Lighthouse scores on mobile, and we'll follow up with a fix plan."
      />
      <div className="mt-10">
        <AuditForm />
      </div>
    </section>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
