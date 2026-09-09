import { createClient } from "@/lib/supabase/server";
import { CrudManager, type FieldDef } from "../crud-manager";
export const metadata = { title: "Knowledge base", robots: { index: false } };
const fields: FieldDef[] = [{ name: "title", label: "Title", type: "text", required: true },
{ name: "slug", label: "Slug", type: "text", required: true },
{ name: "summary", label: "Summary", type: "textarea", required: true },
{ name: "body", label: "Content (HTML and internal CSS)", type: "richtext" },
{ name: "category", label: "Category", type: "text" },
{ name: "tags", label: "Tags", type: "list" },
{ name: "published_at", label: "Publication date (ISO 8601)", type: "text" },
{ name: "published", label: "Published", type: "boolean" },
{ name: "sort_order", label: "Sort order", type: "number" }];
export default async function ContentAdmin() {
  const client = await createClient();
  const { data, error } = await client.from("knowledge_base").select("*, knowledge_base_tags(tag)");
  const rows = (data ?? []).map(r => ({ ...r, tags: r.knowledge_base_tags.map((x: {tag: string}) => x.tag) }));
  return <div><h1 className="mb-6 text-2xl font-bold">Knowledge base</h1>{error ? <p role="alert">Content unavailable. Apply the required database migrations.</p> : <CrudManager table="knowledge_base" fields={fields} columns={[{ name: "title", label: "Knowledge base" }, { name: "slug", label: "Slug" }]} rows={rows} />}</div>;
}
