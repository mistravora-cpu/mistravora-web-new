-- 0020: demo_apps table and related tables
-- Showcase demo applications, optionally linked to solutions.

-- ─── demo_apps ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.demo_apps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text,
  url         text,
  screenshot  text,
  image       text,
  industry    text,
  solution_id uuid REFERENCES public.solutions(id) ON DELETE SET NULL,
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_apps ENABLE ROW LEVEL SECURITY;

-- Public can read published demo apps
CREATE POLICY "public read published demo_apps"
  ON public.demo_apps FOR SELECT
  USING (published = true);

-- Admins can manage all demo apps
CREATE POLICY "admins full access demo_apps"
  ON public.demo_apps FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS demo_apps_slug_idx ON public.demo_apps (slug);
CREATE INDEX IF NOT EXISTS demo_apps_sort_order_idx ON public.demo_apps (sort_order);
CREATE INDEX IF NOT EXISTS demo_apps_solution_id_idx ON public.demo_apps (solution_id);
CREATE INDEX IF NOT EXISTS demo_apps_published_idx ON public.demo_apps (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_demo_apps
  BEFORE UPDATE ON public.demo_apps
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── demo_app_features ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.demo_app_features (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_app_id uuid NOT NULL REFERENCES public.demo_apps(id) ON DELETE CASCADE,
  feature     text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

ALTER TABLE public.demo_app_features ENABLE ROW LEVEL SECURITY;

-- Public can read features for published demo apps
CREATE POLICY "public read demo_app_features"
  ON public.demo_app_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.demo_apps
      WHERE demo_apps.id = demo_app_features.demo_app_id
        AND demo_apps.published = true
    )
  );

-- Admins can manage all demo app features
CREATE POLICY "admins full access demo_app_features"
  ON public.demo_app_features FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS demo_app_features_demo_app_id_idx ON public.demo_app_features (demo_app_id);

-- ─── solution_demo_links ──────────────────────────────────────────────
-- Junction table linking solutions to demo apps.
CREATE TABLE IF NOT EXISTS public.solution_demo_links (
  solution_id uuid NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  demo_app_id uuid NOT NULL REFERENCES public.demo_apps(id) ON DELETE CASCADE,
  PRIMARY KEY (solution_id, demo_app_id)
);

ALTER TABLE public.solution_demo_links ENABLE ROW LEVEL SECURITY;

-- Public can read all solution_demo_links
CREATE POLICY "public read solution_demo_links"
  ON public.solution_demo_links FOR SELECT
  USING (true);

-- Admins can manage all solution_demo_links
CREATE POLICY "admins full access solution_demo_links"
  ON public.solution_demo_links FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS solution_demo_links_solution_id_idx ON public.solution_demo_links (solution_id);
CREATE INDEX IF NOT EXISTS solution_demo_links_demo_app_id_idx ON public.solution_demo_links (demo_app_id);
