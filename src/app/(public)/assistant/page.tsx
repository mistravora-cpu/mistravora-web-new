import Link from "next/link";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { site } from "@/lib/site";
import { Chat } from "./chat";

const baseMetadata: Metadata = withSocialMetadata({
  title: "AI Assistant",
  description:
    "Chat with Mistravora's AI assistant about services, pricing, timelines, and how we build fast, conversion-focused software.",
  alternates: { canonical: `${site.url}/assistant` },
});

export default function AssistantPage() {
  return (
    <section className="flex w-full flex-1 flex-col site-gutter py-16">
      <PageHeader
        as="h1"
        title="AI Assistant"
        description="Ask anything about Mistravora — services, pricing, process, or how we'd approach your project."
      />
      <p className="mt-6 text-sm leading-6 text-muted-foreground">Automated answers may be wrong. Do not submit sensitive personal or customer information. <Link href="/policies/privacy-policy" className="underline">Privacy Policy</Link></p>
      <div className="mt-10">
        <Chat />
      </div>
    </section>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
