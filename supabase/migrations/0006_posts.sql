-- 0006: posts table and child table
-- Stores blog posts (optionally mirrored from Medium). Child table replaces
-- array columns: tags.

-- ─── posts ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  excerpt      text,
  body         text,
  cover_image  text,
  author       text,
  author_role  text,
  medium_url   text,
  category     text,
  read_time    text,
  featured     boolean NOT NULL DEFAULT false,
  published    boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "public read posts"
  ON public.posts FOR SELECT
  USING (published = true);

-- Admins can manage all posts
CREATE POLICY "admins full access posts"
  ON public.posts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS posts_slug_idx        ON public.posts (slug);
CREATE INDEX IF NOT EXISTS posts_published_idx   ON public.posts (published);
CREATE INDEX IF NOT EXISTS posts_featured_idx    ON public.posts (featured);
CREATE INDEX IF NOT EXISTS posts_published_at_idx ON public.posts (published_at);

CREATE TRIGGER set_updated_at_posts
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── post_tags ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_tags (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag        text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Public can read tags whose parent post is published
CREATE POLICY "public read post_tags"
  ON public.post_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_tags.post_id
        AND p.published = true
    )
  );

-- Admins can manage all post_tags
CREATE POLICY "admins full access post_tags"
  ON public.post_tags FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS post_tags_post_id_idx ON public.post_tags (post_id);
