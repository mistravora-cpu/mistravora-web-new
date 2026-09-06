import { createClient } from "@/lib/supabase/server";
import { CrudManager, type FieldDef } from "../crud-manager";
export const metadata = { title: "Email campaigns", robots: { index: false } };
const fields: FieldDef[] = [{ name: "title", label: "Internal campaign name", type: "text" },
{ name: "subject", label: "Email subject", type: "text" },
{ name: "body", label: "Plain-text email body", type: "textarea" },
{ name: "status", label: "Status", type: "select", options: ["draft", "scheduled", "paused"] },
{ name: "scheduled_at", label: "Send after (ISO 8601 with timezone)", type: "text" }];
export default async function AdminPage() {
  const db = await createClient(); const { data, error } = await db.from("email_campaigns").select("*").order("created_at", { ascending: false });
  return <div><h1 className="text-2xl font-bold">Email campaigns</h1><p className="my-4 text-sm text-muted-foreground">Create a draft, review its subject and body, then schedule it. Delivery runs only when the email provider and authenticated worker are configured.</p>{error ? <p role="alert">Apply migration 0039 to enable this module.</p> : <CrudManager table="email_campaigns" fields={fields} columns={fields.slice(0, 4).map(f => ({ name: f.name, label: f.label }))} rows={data ?? []} />}</div>;
}
