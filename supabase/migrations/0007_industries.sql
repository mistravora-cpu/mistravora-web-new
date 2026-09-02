-- 0007: industries table and child tables
-- Stores industry landing pages (e.g. Retail, Healthcare). Child tables
-- replace array columns: challenges and solutions.

-- ─── industries ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.industries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon        text NOT NULL DEFAULT 'ShoppingBag',
  title       text NOT NULL,
  slug        text NOT NULL UNIQUE,
  summary     text,
  description text,
  image       text,
  archived    boolean NOT NULL DEFAULT false,
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

-- Public can read non-archived industries
CREATE POLICY "public read industries"
  ON public.industries FOR SELECT
  USING (archived = false);

-- Admins can manage all industries
CREATE POLICY "admins full access industries"
  ON public.industries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS industries_slug_idx       ON public.industries (slug);
CREATE INDEX IF NOT EXISTS industries_archived_idx   ON public.industries (archived);
CREATE INDEX IF NOT EXISTS industries_sort_order_idx ON public.industries (sort_order);

CREATE TRIGGER set_updated_at_industries
  BEFORE UPDATE ON public.industries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── industry_challenges ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.industry_challenges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id uuid NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  challenge   text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

ALTER TABLE public.industry_challenges ENABLE ROW LEVEL SECURITY;

-- Public can read challenges whose parent industry is not archived
CREATE POLICY "public read industry_challenges"
  ON public.industry_challenges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.industries i
      WHERE i.id = industry_challenges.industry_id
        AND i.archived = false
    )
  );

-- Admins can manage all industry_challenges
CREATE POLICY "admins full access industry_challenges"
  ON public.industry_challenges FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS industry_challenges_industry_id_idx ON public.industry_challenges (industry_id);

-- ─── industry_solutions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.industry_solutions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id uuid NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  solution    text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

ALTER TABLE public.industry_solutions ENABLE ROW LEVEL SECURITY;

-- Public can read solutions whose parent industry is not archived
CREATE POLICY "public read industry_solutions"
  ON public.industry_solutions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.industries i
      WHERE i.id = industry_solutions.industry_id
        AND i.archived = false
    )
  );

-- Admins can manage all industry_solutions
CREATE POLICY "admins full access industry_solutions"
  ON public.industry_solutions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS industry_solutions_industry_id_idx ON public.industry_solutions (industry_id);
