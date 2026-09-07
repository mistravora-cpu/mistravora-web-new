import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { ContentEntry } from "@/lib/content";

export function ContentGrid({ entries, prefix }: { entries: ContentEntry[]; prefix: string }) {
  return entries.length ? <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{entries.map(entry => <article key={entry.slug} className="group interactive-card p-6 transition-all hover:-translate-y-0.5">{entry.image && (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={entry.image} alt={entry.title} loading="lazy" decoding="async" width={800} height={450} className="mb-5 aspect-video w-full rounded-lg object-cover" />
  )}<h2 className="text-lg font-semibold tracking-tight"><Link href={`${prefix}/${entry.slug}`} className="transition-colors group-hover:text-primary">{entry.title}</Link></h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.description}</p><Link href={`${prefix}/${entry.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors">Explore {entry.title} <span aria-hidden>→</span></Link></article>)}</div> : <p className="mt-10 text-muted-foreground">We’re preparing content for this section. <Link href="/contact" className="text-primary underline">Ask our team</Link> for help in the meantime.</p>;
}
export function ContentShell({ title, description, children, parent }: { title: string; description?: string; children: React.ReactNode; parent?: { label: string; href: string } }) {
  return <main className="mx-auto w-full site-gutter py-16"><Breadcrumbs items={[...(parent ? [parent] : []), { label: title }]} /><h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>{description && <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p>}{children}</main>;
}
