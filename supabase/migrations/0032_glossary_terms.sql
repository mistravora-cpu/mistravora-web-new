-- 0032: glossary_terms table
-- Stores AI/ML glossary terms for AI discovery and SEO.

-- ─── glossary_terms ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.glossary_terms (
  id                            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term                          text NOT NULL,
  slug                          text NOT NULL UNIQUE,
  definition                    text NOT NULL,
  explanation                   text,
  examples                      text,
  related_concepts              text,
  mistravora_service_relationship text,
  category                      text,
  sort_order                    int NOT NULL DEFAULT 0,
  published                     boolean NOT NULL DEFAULT false,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

-- Public can read published glossary terms
CREATE POLICY "public read glossary_terms"
  ON public.glossary_terms FOR SELECT
  USING (published = true);

-- Admins can manage all glossary terms
CREATE POLICY "admins full access glossary_terms"
  ON public.glossary_terms FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS glossary_terms_slug_idx      ON public.glossary_terms (slug);
CREATE INDEX IF NOT EXISTS glossary_terms_published_idx ON public.glossary_terms (published);
CREATE INDEX IF NOT EXISTS glossary_terms_category_idx  ON public.glossary_terms (category);

CREATE TRIGGER set_updated_at_glossary_terms
  BEFORE UPDATE ON public.glossary_terms
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
