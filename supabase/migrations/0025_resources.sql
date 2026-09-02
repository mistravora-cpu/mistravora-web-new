-- 0025: resources table
-- Downloadable resources and guides.

CREATE TABLE IF NOT EXISTS public.resources (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  slug       text NOT NULL UNIQUE,
  category   text NOT NULL DEFAULT 'Guides',
  description text,
  featured   boolean NOT NULL DEFAULT false,
  downloads  int NOT NULL DEFAULT 0,
  file_url   text,
  sort_order int NOT NULL DEFAULT 0,
  published  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Public can read published resources
CREATE POLICY "public read published resources"
  ON public.resources FOR SELECT
  USING (published = true);

-- Admins can manage all resources
CREATE POLICY "admins full access resources"
  ON public.resources FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS resources_slug_idx ON public.resources (slug);
CREATE INDEX IF NOT EXISTS resources_category_idx ON public.resources (category);
CREATE INDEX IF NOT EXISTS resources_sort_order_idx ON public.resources (sort_order);
CREATE INDEX IF NOT EXISTS resources_published_idx ON public.resources (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_resources
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
