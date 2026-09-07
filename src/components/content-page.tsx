import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { ContentEntry } from "@/lib/content";

export function ContentGrid({ entries, prefix }: { entries: ContentEntry[]; prefix: string }) {
  return entries.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{entries.map(entry => <article key={entry.slug} className="rounded-xl border border-border bg-card p-6"><h2 className="text-xl font-semibold"><Link href={`${prefix}/${entry.slug}`} className="hover:text-primary">{entry.title}</Link></h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{entry.description}</p><Link href={`${prefix}/${entry.slug}`} className="mt-4 inline-block text-sm text-primary">Explore {entry.title} →</Link></article>)}</div> : <p className="mt-8 text-muted-foreground">We’re preparing content for this section. <Link href="/contact" className="text-primary underline">Ask our team</Link> for help in the meantime.</p>;
}
export function ContentShell({ title, description, children, parent }: { title: string; description?: string; children: React.ReactNode; parent?: { label: string; href: string } }) {
  return <main className="mx-auto w-full site-gutter py-12"><Breadcrumbs items={[...(parent ? [parent] : []), { label: title }]} /><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>{description && <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>}{children}</main>;
}
