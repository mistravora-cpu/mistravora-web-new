import Link from "next/link";
import { getSearchEntries } from "@/lib/content";
export async function RelatedContent({ currentPath, title }: { currentPath: string; title: string }) {
  const terms = title.toLowerCase().split(/\W+/).filter(t => t.length > 3);
  const entries = (await getSearchEntries()).filter(e => e.href !== currentPath).map(e => ({ ...e, score: terms.filter(t => `${e.title} ${e.description}`.toLowerCase().includes(t)).length })).sort((a,b) => b.score - a.score).slice(0,3);
  if (!entries.length) return null;
  return <aside className="mt-12"><h2 className="text-xl font-semibold">Keep exploring</h2><ul className="mt-4 grid gap-4 sm:grid-cols-3">{entries.map(e => <li key={e.href} className="rounded-xl border border-border bg-card p-5"><span className="text-xs text-muted-foreground">{e.kind}</span><Link href={e.href} className="mt-2 block font-medium hover:text-primary">{e.title}</Link></li>)}</ul></aside>;
}
