import { contentText } from "./content-preview";
export type ArticleSearchParams = { q?: string | string[]; category?: string | string[] };
type Entry = { title: string; category?: string | null; tags?: string[]; excerpt?: string | null; summary?: string | null };
export function filterArticles<T extends Entry>(entries: T[], params: ArticleSearchParams) {
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 150) : "";
  const category = typeof params.category === "string" ? params.category.trim().slice(0, 150) : "";
  const categories = [...new Set(entries.map(entry => entry.category?.trim()).filter((value): value is string => !!value))].sort((a,b)=>a.localeCompare(b));
  const rows = entries.filter(entry => (!category || entry.category?.trim() === category) && (!q || contentText([entry.title,entry.summary,entry.excerpt,...(entry.tags ?? [])].filter(Boolean).join(" ")).toLowerCase().includes(q.toLowerCase())));
  return { q, category, categories, rows };
}
