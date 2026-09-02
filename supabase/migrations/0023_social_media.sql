-- 0023: social_media table
-- Social media links displayed in the footer/contact sections.

CREATE TABLE IF NOT EXISTS public.social_media (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform   text NOT NULL,
  url        text NOT NULL,
  icon       text NOT NULL DEFAULT 'Link',
  sort_order int NOT NULL DEFAULT 0,
  published  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_media ENABLE ROW LEVEL SECURITY;

-- Public can read published social media
CREATE POLICY "public read published social_media"
  ON public.social_media FOR SELECT
  USING (published = true);

-- Admins can manage all social media
CREATE POLICY "admins full access social_media"
  ON public.social_media FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS social_media_sort_order_idx ON public.social_media (sort_order);
CREATE INDEX IF NOT EXISTS social_media_published_idx ON public.social_media (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_social_media
  BEFORE UPDATE ON public.social_media
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
