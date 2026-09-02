import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";
import { AuditForm } from "./audit-form";

export const metadata: Metadata = {
  title: "AI Website Audit",
  description:
    "Get a free performance, accessibility, and SEO score for your website in seconds — powered by Google Lighthouse.",
  alternates: { canonical: `${site.url}/tools/website-audit` },
};

export default function WebsiteAuditPage() {
  return (
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
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
