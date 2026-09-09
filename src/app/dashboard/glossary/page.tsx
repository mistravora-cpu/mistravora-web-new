import { createClient } from "@/lib/supabase/server";
import { CrudManager, type FieldDef } from "../crud-manager";
export const metadata = { title: "Glossary", robots: { index: false } };
const fields: FieldDef[] = [{ name: "term", label: "Term", type: "text", required: true },
{ name: "slug", label: "Slug", type: "text", required: true },
{ name: "definition", label: "Definition", type: "textarea", required: true },
{ name: "explanation", label: "Explanation", type: "richtext" },
{ name: "examples", label: "Examples", type: "richtext" },
{ name: "category", label: "Category", type: "text" },
{ name: "published", label: "Published", type: "boolean" },
{ name: "sort_order", label: "Sort order", type: "number" }];
export default async function ContentAdmin() {
  const client = await createClient();
  const { data, error } = await client.from("glossary_terms").select("*");
  const rows = data ?? [];
  return <div><h1 className="mb-6 text-2xl font-bold">Glossary</h1>{error ? <p role="alert">Content unavailable. Apply the required database migrations.</p> : <CrudManager table="glossary_terms" fields={fields} columns={[{ name: "term", label: "Glossary" }, { name: "slug", label: "Slug" }]} rows={rows} />}</div>;
}
