import Link from "next/link";
export function ArticleFilters({ path, q, category, categories, count }: { path: string; q: string; category: string; categories: string[]; count: number }) {
  const id = path.slice(1);
  return <div className="mt-8">
    <form action={path} method="get" role="search" aria-label={`Search ${id}`} className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1"><label htmlFor={`${id}-search`} className="mb-2 block text-sm font-medium">Search articles</label><input id={`${id}-search`} name="q" defaultValue={q} maxLength={150} placeholder="Search titles, summaries and tags" className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm" /></div>
      <div className="sm:w-64"><label htmlFor={`${id}-category`} className="mb-2 block text-sm font-medium">Category</label><select id={`${id}-category`} name="category" defaultValue={category} className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">All categories</option>{category && !categories.includes(category) && <option value={category}>{category}</option>}{categories.map(value=><option key={value} value={value}>{value}</option>)}</select></div>
      <button type="submit" className="min-h-11 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">Apply filters</button>
      {(q || category) && <Link prefetch={false} href={path} className="inline-flex min-h-11 items-center px-3 text-sm text-primary underline">Clear filters</Link>}
    </form>
    <p className="mt-3 text-sm text-muted-foreground">{count} {count === 1 ? "article" : "articles"}{q || category ? " matching your filters" : " available"}</p>
  </div>;
}
