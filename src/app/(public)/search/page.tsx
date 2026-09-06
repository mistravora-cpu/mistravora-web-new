import Link from "next/link";
import { getSearchEntries } from "@/lib/content";
import { ContentShell } from "@/components/content-page";
export const metadata = { title: "Search", robots: { index: false, follow: true } };
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams; const query = q.trim().slice(0, 100);
  const results = query ? (await getSearchEntries()).filter(p => `${p.title} ${p.description}`.toLowerCase().includes(query.toLowerCase())).slice(0, 50) : [];
  return <ContentShell title="Search Mistravora"><form action="/search" className="mt-6 flex gap-3"><label htmlFor="q" className="sr-only">Search query</label><input id="q" name="q" type="search" defaultValue={query} maxLength={100} className="w-full rounded-lg border border-border bg-card px-4 py-3" /><button className="rounded-lg bg-primary px-5 text-primary-foreground">Search</button></form>{query && <p className="mt-5 text-muted-foreground">{results.length ? `${results.length} results` : "No results. Try a broader term, or contact our team."}</p>}<ul className="mt-6 space-y-5">{results.map(p => <li key={p.href} className="rounded-xl border border-border p-5"><span className="text-xs text-primary">{p.kind}</span><h2 className="mt-1 text-xl font-semibold"><Link href={p.href}>{p.title}</Link></h2><p className="mt-2 text-muted-foreground">{p.description}</p></li>)}</ul><Link href="/contact" className="mt-8 inline-block text-primary underline">Ask us about your project</Link></ContentShell>;
}
