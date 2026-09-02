-- 0021: policies table
-- Legal/policy documents (privacy, terms, etc.).

CREATE TABLE IF NOT EXISTS public.policies (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  slug       text NOT NULL UNIQUE,
  version    text NOT NULL DEFAULT '1.0',
  status     text NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft','archived')),
  body       text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Public can read active policies
CREATE POLICY "public read active policies"
  ON public.policies FOR SELECT
  USING (status = 'active');

-- Admins can manage all policies
CREATE POLICY "admins full access policies"
  ON public.policies FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS policies_slug_idx ON public.policies (slug);
CREATE INDEX IF NOT EXISTS policies_sort_order_idx ON public.policies (sort_order);
CREATE INDEX IF NOT EXISTS policies_status_idx ON public.policies (status);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_policies
  BEFORE UPDATE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
