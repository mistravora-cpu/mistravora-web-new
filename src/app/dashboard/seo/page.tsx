import { createClient } from "@/lib/supabase/server";
import { CrudManager, type FieldDef } from "../crud-manager";
export const metadata = { title: "Page SEO", robots: { index: false } };
const fields: FieldDef[] = [{ name: "path", label: "Page path (/about)", type: "text" },
{ name: "title", label: "SEO title", type: "text" },
{ name: "description", label: "Meta description", type: "textarea" },
{ name: "canonical", label: "Canonical URL (optional)", type: "text" },
{ name: "og_image", label: "Social image (optional)", type: "image" },
{ name: "noindex", label: "Exclude from search", type: "boolean" }];
export default async function AdminPage() {
  const db = await createClient(); const { data, error } = await db.from("page_seo").select("*").order("created_at", { ascending: false });
  return <div><h1 className="text-2xl font-bold">Page SEO</h1><p className="my-4 text-sm text-muted-foreground">Manage page seo.</p>{error ? <p role="alert">Apply migration 0039 to enable this module.</p> : <CrudManager table="page_seo" fields={fields} columns={fields.slice(0, 4).map(f => ({ name: f.name, label: f.label }))} rows={data ?? []} />}</div>;
}
