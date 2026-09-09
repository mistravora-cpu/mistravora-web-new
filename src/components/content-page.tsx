import { CatalogImage } from "./catalog-image";
import { contentText } from "@/lib/content-preview";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { ContentEntry } from "@/lib/content";

export function ContentGrid({ entries, prefix }: { entries: ContentEntry[]; prefix: string }) {
  return entries.length ? <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{entries.map(entry => <article key={entry.slug} className="group interactive-card catalog-card flex flex-col p-5 sm:p-6"><CatalogImage src={entry.image} title={entry.title} /><h2 className="text-lg font-semibold tracking-tight"><Link href={`${prefix}/${entry.slug}`} className="transition-colors group-hover:text-primary">{entry.title}</Link></h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{contentText(entry.description,220)}</p><Link href={`${prefix}/${entry.slug}`} className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors">Explore {entry.title} <span aria-hidden>→</span></Link></article>)}</div> : <p className="mt-10 text-muted-foreground">We’re preparing content for this section. <Link href="/contact" className="text-primary underline">Ask our team</Link> for help in the meantime.</p>;
}
export function ContentShell({ title, description, children, parent }: { title: string; description?: string; children: React.ReactNode; parent?: { label: string; href: string } }) {
  return <main className="mx-auto w-full site-gutter py-16"><Breadcrumbs items={[...(parent ? [parent] : []), { label: title }]} /><h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>{description && <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>}{children}</main>;
}
