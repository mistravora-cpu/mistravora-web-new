import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal, X } from "lucide-react";
import { ArticleCategoryPicker } from "./article-category-picker";

export function ArticleFilters({ path, q, category, categories, count }: { path: string; q: string; category: string; categories: string[]; count: number }) {
  const id = path.slice(1);
  return <div className="mt-8 rounded-2xl border border-border bg-card/70 p-4 sm:p-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal aria-hidden className="h-4 w-4 text-primary" />Explore {id === "blog" ? "our articles" : "our research"}</span>
      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{count} {count === 1 ? "article" : "articles"}{q || category ? " found" : " available"}</span>
    </div>
    <form action={path} method="get" role="search" aria-label={`Search ${id}`} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)_auto] lg:items-end">
      <div className="min-w-0">
        <label htmlFor={`${id}-search`} className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground">Search articles</label>
        <div className="relative"><Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
          <input id={`${id}-search`} name="q" type="search" defaultValue={q} maxLength={150} placeholder="Find a topic, idea or guide…" className="min-h-12 w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-base transition-colors placeholder:text-muted-foreground hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" />
        </div>
      </div>
      <div className="min-w-0"><label id={`${id}-category-label`} htmlFor={`${id}-category`} className="mb-2 block text-xs font-semibold tracking-wide text-muted-foreground">Category</label><ArticleCategoryPicker key={`${path}:${category}`} id={`${id}-category`} category={category} categories={categories} /></div>
      <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Apply filters<ArrowRight aria-hidden className="h-4 w-4" /></button>
    </form>
    {(q || category) && <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4 text-sm">
      <span className="min-w-0 flex-1 break-words text-muted-foreground">{q && <>Search: “{q}”</>}{q && category && " · "}{category && <>Category: {category}</>}</span>
      <Link prefetch={false} href={path} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-primary hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary"><X aria-hidden className="h-4 w-4" />Clear filters</Link>
    </div>}
  </div>;
}
