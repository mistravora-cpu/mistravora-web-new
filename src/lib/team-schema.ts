import "server-only";
import { createClient } from "@/lib/supabase/server";
export const extendedTeamFields = new Set(["slug", "category", "department", "location", "expertise", "github", "instagram", "facebook", "website", "email"]);
/** Keep existing profile edits working while the additive migration is pending. */
export async function hasExtendedTeamSchema() {
  const db = await createClient();
  const {error} = await db.from("team_members").select([...extendedTeamFields].join(",")).limit(0);
  if (!error) return true;
  if (error.code === "42703" || error.code === "PGRST204") return false;
  throw error;
}
