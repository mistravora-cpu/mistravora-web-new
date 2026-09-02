import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current user is authenticated AND is in the admin_users table.
 * Returns the user object if authorized, or null if not.
 *
 * Usage in API routes:
 *   const admin = await requireAdmin();
 *   if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!adminRecord) return null;

  return { ...user, role: adminRecord.role };
}
