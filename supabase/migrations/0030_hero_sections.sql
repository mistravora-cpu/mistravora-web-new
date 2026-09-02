-- 0030: hero_sections table
-- Configurable hero/banner sections per page.

CREATE TABLE IF NOT EXISTS public.hero_sections (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page                  text NOT NULL DEFAULT 'home',
  badge                 text,
  headline              text NOT NULL,
  highlighted_text      text,
  description           text,
  primary_button_text   text,
  primary_button_link   text,
  secondary_button_text text,
  secondary_button_link text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_sections ENABLE ROW LEVEL SECURITY;

-- Public can read all hero sections
CREATE POLICY "public read hero_sections"
  ON public.hero_sections FOR SELECT
  USING (true);

-- Admins can manage all hero sections
CREATE POLICY "admins full access hero_sections"
  ON public.hero_sections FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS hero_sections_page_idx ON public.hero_sections (page);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_hero_sections
  BEFORE UPDATE ON public.hero_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
