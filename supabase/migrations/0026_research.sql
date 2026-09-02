-- 0026: research table and research_tags
-- Research articles/blog posts with optional tags.

-- ─── research ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.research (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  summary      text NOT NULL,
  body         text,
  category     text,
  cover_image  text,
  author       text,
  published    boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  sort_order   int NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.research ENABLE ROW LEVEL SECURITY;

-- Public can read published research
CREATE POLICY "public read published research"
  ON public.research FOR SELECT
  USING (published = true);

-- Admins can manage all research
CREATE POLICY "admins full access research"
  ON public.research FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS research_slug_idx ON public.research (slug);
CREATE INDEX IF NOT EXISTS research_published_idx ON public.research (published);
CREATE INDEX IF NOT EXISTS research_published_at_idx ON public.research (published_at DESC);
CREATE INDEX IF NOT EXISTS research_category_idx ON public.research (category);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_research
  BEFORE UPDATE ON public.research
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── research_tags ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.research_tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id uuid NOT NULL REFERENCES public.research(id) ON DELETE CASCADE,
  tag        text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.research_tags ENABLE ROW LEVEL SECURITY;

-- Public can read tags for published research
CREATE POLICY "public read research_tags"
  ON public.research_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.research
      WHERE research.id = research_tags.research_id
        AND research.published = true
    )
  );

-- Admins can manage all research tags
CREATE POLICY "admins full access research_tags"
  ON public.research_tags FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS research_tags_research_id_idx ON public.research_tags (research_id);
