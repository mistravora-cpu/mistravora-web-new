-- 0003: Shared PostgreSQL functions
-- These functions are used by RLS policies and triggers across all tables.

-- ─── is_admin() ───────────────────────────────────────────────────────
-- Returns true if the current authenticated user is in the admin_users table.
-- Used by all admin RLS policies. SECURITY DEFINER so it can read admin_users
-- even when the calling role doesn't have direct access.
-- search_path is pinned for security (Supabase database linter requirement).
-- EXECUTE is revoked from anon/authenticated because only RLS policies call it.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated;

-- ─── set_updated_at() ─────────────────────────────────────────────────
-- Trigger function that automatically updates the updated_at column
-- on any row before an UPDATE operation.
-- search_path is pinned for security (Supabase database linter requirement).

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
