import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/**
 * Cookieless Supabase client for public read-only queries.
 *
 * The standard server client (src/lib/supabase/server.ts) calls cookies()
 * from next/headers, which is a dynamic data source that cannot be used
 * inside unstable_cache(). This client skips cookie handling entirely,
 * making it safe to use within cached functions.
 *
 * RLS policies still apply — this client uses the anon key, so only
 * public-readable rows are returned (published = true, etc.).
 */
export function createPublicClient() {
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op — public client doesn't manage sessions.
        },
      },
    }
  );
}
