import { createClient } from "@/lib/supabase/server";
import { CrudManager, type FieldDef } from "../crud-manager";
export const metadata = { title: "Appointment availability", robots: { index: false } };
const fields: FieldDef[] = [{ name: "starts_at", label: "Start (ISO 8601 with timezone)", type: "text" },
{ name: "ends_at", label: "End (ISO 8601 with timezone)", type: "text" },
{ name: "available", label: "Available", type: "boolean" }];
export default async function AdminPage() {
  const db = await createClient(); const { data, error } = await db.from("booking_slots").select("*").order("created_at", { ascending: false });
  return <div><h1 className="text-2xl font-bold">Appointment availability</h1><p className="my-4 text-sm text-muted-foreground">Manage appointment availability.</p>{error ? <p role="alert">Apply migration 0039 to enable this module.</p> : <CrudManager table="booking_slots" fields={fields} columns={fields.slice(0, 4).map(f => ({ name: f.name, label: f.label }))} rows={data ?? []} />}</div>;
}
