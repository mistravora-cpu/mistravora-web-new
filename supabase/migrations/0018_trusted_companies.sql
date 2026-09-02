-- 0018: trusted_companies table
-- Logos/cards of trusted companies displayed on the landing page.

CREATE TABLE IF NOT EXISTS public.trusted_companies (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  category     text,
  description  text,
  featured     boolean NOT NULL DEFAULT false,
  logo         text,
  website_url  text,
  demo_url     text,
  sort_order   int NOT NULL DEFAULT 0,
  published    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trusted_companies ENABLE ROW LEVEL SECURITY;

-- Public can read published trusted companies
CREATE POLICY "public read published trusted_companies"
  ON public.trusted_companies FOR SELECT
  USING (published = true);

-- Admins can manage all trusted companies
CREATE POLICY "admins full access trusted_companies"
  ON public.trusted_companies FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS trusted_companies_sort_order_idx ON public.trusted_companies (sort_order);
CREATE INDEX IF NOT EXISTS trusted_companies_published_idx ON public.trusted_companies (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_trusted_companies
  BEFORE UPDATE ON public.trusted_companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
