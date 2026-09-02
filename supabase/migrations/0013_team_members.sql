-- 0013: team_members table
-- Team member profiles displayed on the about/team page.

CREATE TABLE IF NOT EXISTS public.team_members (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  role        text NOT NULL,
  bio         text,
  photo       text,
  linkedin    text,
  x_handle    text,
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Public can read published team members
CREATE POLICY "public read published team_members"
  ON public.team_members FOR SELECT
  USING (published = true);

-- Admins can manage all team members
CREATE POLICY "admins full access team_members"
  ON public.team_members FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS team_members_sort_order_idx ON public.team_members (sort_order);
CREATE INDEX IF NOT EXISTS team_members_published_idx ON public.team_members (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_team_members
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
