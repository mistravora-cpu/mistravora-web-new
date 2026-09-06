import { createClient } from "@/lib/supabase/server";
export const metadata = { title: "Email delivery log", robots: { index: false } };
export default async function LogPage() {
  const db = await createClient(); const { data, error } = await db.from("email_deliveries").select("*").order("created_at", { ascending: false }).limit(100);
  const columns = ["campaign_id", "status", "error", "created_at"];
  return <div><h1 className="mb-6 text-2xl font-bold">Email delivery log</h1>{error ? <p>Apply migration 0039 to enable this log.</p> : <div className="overflow-auto"><table className="w-full text-left text-sm"><thead><tr>{columns.map(c => <th className="p-3" key={c}>{c.replaceAll("_", " ")}</th>)}</tr></thead><tbody>{(data ?? []).map(row => <tr key={row.id} className="border-t border-border">{columns.map(c => <td key={c} className="p-3">{String(row[c] ?? "—")}</td>)}</tr>)}</tbody></table></div>}</div>;
}
