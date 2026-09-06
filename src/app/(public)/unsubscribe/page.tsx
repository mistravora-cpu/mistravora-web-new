import { ContentShell } from "@/components/content-page";
import { UnsubscribeForm } from "./unsubscribe-form";
export const metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <ContentShell title="Email preferences" description="Stop receiving Mistravora marketing emails. Your service and project communications are unaffected."><UnsubscribeForm token={token} /></ContentShell>;
}
