import { createClient } from "@/lib/supabase/server";
import { CrudManager, type FieldDef } from "../crud-manager";
export const metadata = { title: "Services", robots: { index: false } };
const fields: FieldDef[] = [{ name: "title", label: "Title", type: "text", required: true },
{ name: "slug", label: "Slug", type: "text", required: true },
{ name: "tagline", label: "Tagline", type: "text" },
{ name: "description", label: "Description", type: "richtext" },
{ name: "body", label: "Content (HTML and internal CSS)", type: "richtext" },
{ name: "category", label: "Category", type: "text" },
{ name: "features", label: "Features", type: "list" },
{ name: "technologies", label: "Technologies", type: "list" },
{ name: "published", label: "Published", type: "boolean" },
{ name: "sort_order", label: "Sort order", type: "number" }];
export default async function ContentAdmin() {
  const client = await createClient();
  const { data, error } = await client.from("services").select("*, service_features(feature), service_technologies(technology)");
  const rows = (data ?? []).map(r => ({ ...r, features: r.service_features.map((x: {feature: string}) => x.feature), technologies: r.service_technologies.map((x: {technology: string}) => x.technology) }));
  return <div><h1 className="mb-6 text-2xl font-bold">Services</h1>{error ? <p role="alert">Content unavailable. Apply the required database migrations.</p> : <CrudManager table="services" fields={fields} columns={[{ name: "title", label: "Services" }, { name: "slug", label: "Slug" }]} rows={rows} />}</div>;
}
