import type { Metadata } from "next";
import { getMarketingSettings } from "@/lib/services";
import { MarketingEditor } from "./marketing-editor";
import { marketingKeys } from "./marketing-keys";

export const metadata: Metadata = {
  title: "Marketing & SEO",
  robots: { index: false, follow: false },
};

export default async function MarketingAdminPage() {
  const m = await getMarketingSettings();
  const initialData: Record<string, string> = {};
  for (const key of marketingKeys) {
    initialData[key] = (m as Record<string, string>)[key] || (key === "enable_optional_tracking" ? "false" : "");
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Marketing & SEO</h1>
        <p className="text-sm text-muted-foreground">
          Manage advertising pixels, analytics, search engine verification, and SEO defaults.
          Search verification is live. Supported analytics and advertising tags require the enable switch and visitor consent.
        </p>
      </div>
      <MarketingEditor initialData={initialData} />
    </div>
  );
}
