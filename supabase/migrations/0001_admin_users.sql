-- 0001: admin_users table
-- Whitelist of users who can access the admin dashboard.
-- Links to auth.users via foreign key.
-- NOTE: The is_admin() policy is created in 0003_functions.sql after the
-- function exists. The seed insert is removed from here because the auth.users
-- row must exist first. Add yourself as admin AFTER creating your auth account:
--   INSERT INTO public.admin_users (id, email, role)
--   VALUES ('<your-auth-uuid>', 'your@email.com', 'super_admin');

CREATE TABLE IF NOT EXISTS public.admin_users (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  role       text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin can read their own row
CREATE POLICY "admin can read own row"
  ON public.admin_users FOR SELECT
  USING (auth.uid() = id);

CREATE INDEX IF NOT EXISTS admin_users_id_idx ON public.admin_users (id);

-- Super admins can manage all admin users (requires is_admin() from 0003)
CREATE POLICY "super admin full access admin_users"
  ON public.admin_users FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
