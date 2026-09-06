import { createClient } from "@/lib/supabase/server";
import { CrudManager, type FieldDef } from "../crud-manager";
export const metadata = { title: "Bookings", robots: { index: false } };
const fields: FieldDef[] = [{ name: "name", label: "Name", type: "text" },
{ name: "email", label: "Email", type: "text" },
{ name: "message", label: "Message", type: "textarea" },
{ name: "status", label: "Status", type: "select", options: ["confirmed", "completed", "cancelled", "no_show"] }];
export default async function AdminPage() {
  const db = await createClient(); const { data, error } = await db.from("bookings").select("*").order("created_at", { ascending: false });
  return <div><h1 className="text-2xl font-bold">Bookings</h1><p className="my-4 text-sm text-muted-foreground">Manage bookings.</p>{error ? <p role="alert">Apply migration 0039 to enable this module.</p> : <CrudManager table="bookings" fields={fields} columns={fields.slice(0, 4).map(f => ({ name: f.name, label: f.label }))} rows={data ?? []} />}</div>;
}
