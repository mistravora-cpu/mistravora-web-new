-- 0031: authors table
-- Stores blog post authors for AI discovery and attribution.

-- ─── authors ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.authors (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  role        text,
  bio         text,
  photo       text,
  linkedin    text,
  x_handle    text,
  github      text,
  expertise   text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;

-- Public can read all authors
CREATE POLICY "public read authors"
  ON public.authors FOR SELECT
  USING (true);

-- Admins can manage all authors
CREATE POLICY "admins full access authors"
  ON public.authors FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS authors_slug_idx ON public.authors (slug);

CREATE TRIGGER set_updated_at_authors
  BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
