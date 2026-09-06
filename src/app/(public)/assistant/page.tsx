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
    <section className="flex w-full flex-1 flex-col px-4 py-16 sm:px-8 lg:px-12">
      <PageHeader
        as="h1"
        title="AI Assistant"
        description="Ask anything about Mistravora — services, pricing, process, or how we'd approach your project."
      />
      <div className="mt-10">
        <Chat />
      </div>
    </section>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
