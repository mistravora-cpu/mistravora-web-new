-- 0002: settings table
-- Key-value store for all site-wide configuration.
-- Marketing, analytics, SEO, contact info, social links, etc.

CREATE TABLE IF NOT EXISTS public.settings (
  key         text PRIMARY KEY,
  value       text,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public can read all settings (needed for marketing tags, SEO, etc.)
CREATE POLICY "public read settings"
  ON public.settings FOR SELECT
  USING (true);

-- Admins can manage settings
CREATE POLICY "admins full access settings"
  ON public.settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
