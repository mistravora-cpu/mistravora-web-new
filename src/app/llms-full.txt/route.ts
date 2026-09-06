import { getSearchEntries } from "@/lib/content";
import { getBusinessProfile } from "@/lib/business-profile";
export const revalidate = 300;
export async function GET() {
  const site = await getBusinessProfile();
  const entries = await getSearchEntries();
  return new Response(`# ${site.name}\n\n${site.description}\n\nContact: ${site.email}\n\n${entries.map(e => `## ${e.title}\n${site.url}${e.href}\n${e.description}`).join("\n\n")}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
