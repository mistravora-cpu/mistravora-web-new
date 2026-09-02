-- 0033: knowledge_base table and child table
-- Stores knowledge base articles for AI discovery and SEO.
-- Child table replaces array columns: tags.

-- ─── knowledge_base ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  slug          text NOT NULL UNIQUE,
  summary       text NOT NULL,
  body          text,
  category      text,
  author_id     uuid REFERENCES public.authors(id) ON DELETE SET NULL,
  cover_image   text,
  published     boolean NOT NULL DEFAULT false,
  published_at  timestamptz,
  sort_order    int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Public can read published knowledge base articles
CREATE POLICY "public read knowledge_base"
  ON public.knowledge_base FOR SELECT
  USING (published = true);

-- Admins can manage all knowledge base articles
CREATE POLICY "admins full access knowledge_base"
  ON public.knowledge_base FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS knowledge_base_slug_idx         ON public.knowledge_base (slug);
CREATE INDEX IF NOT EXISTS knowledge_base_published_idx    ON public.knowledge_base (published);
CREATE INDEX IF NOT EXISTS knowledge_base_published_at_idx ON public.knowledge_base (published_at DESC);
CREATE INDEX IF NOT EXISTS knowledge_base_category_idx     ON public.knowledge_base (category);

CREATE TRIGGER set_updated_at_knowledge_base
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── knowledge_base_tags ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_base_tags (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id uuid NOT NULL REFERENCES public.knowledge_base(id) ON DELETE CASCADE,
  tag               text NOT NULL,
  sort_order        int NOT NULL DEFAULT 0
);

ALTER TABLE public.knowledge_base_tags ENABLE ROW LEVEL SECURITY;

-- Public can read tags whose parent article is published
CREATE POLICY "public read knowledge_base_tags"
  ON public.knowledge_base_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.knowledge_base kb
      WHERE kb.id = knowledge_base_tags.knowledge_base_id
        AND kb.published = true
    )
  );

-- Admins can manage all knowledge base tags
CREATE POLICY "admins full access knowledge_base_tags"
  ON public.knowledge_base_tags FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS knowledge_base_tags_knowledge_base_id_idx
  ON public.knowledge_base_tags (knowledge_base_id);
