import { createClient } from "@/lib/supabase/server";
import { CrudManager, type FieldDef } from "../crud-manager";
export const metadata = { title: "Authors", robots: { index: false } };
const fields: FieldDef[] = [{ name: "name", label: "Name", type: "text", required: true },
{ name: "slug", label: "Slug", type: "text", required: true },
{ name: "role", label: "Role", type: "text" },
{ name: "bio", label: "Biography", type: "textarea" },
{ name: "expertise", label: "Expertise", type: "textarea" },
{ name: "photo", label: "Photo", type: "image" },
{ name: "linkedin", label: "LinkedIn URL", type: "text" },
{ name: "github", label: "GitHub URL", type: "text" }];
export default async function ContentAdmin() {
  const client = await createClient();
  const { data, error } = await client.from("authors").select("*");
  const rows = data ?? [];
  return <div><h1 className="mb-6 text-2xl font-bold">Authors</h1>{error ? <p role="alert">Content unavailable. Apply the required database migrations.</p> : <CrudManager table="authors" fields={fields} columns={[{ name: "name", label: "Authors" }, { name: "slug", label: "Slug" }]} rows={rows} />}</div>;
}
