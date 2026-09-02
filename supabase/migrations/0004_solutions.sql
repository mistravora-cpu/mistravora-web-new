-- 0004: solutions table and child tables
-- Stores Mistravora's service offerings (e.g. AI, cloud, automation).
-- Child tables replace array columns: features, technologies, services,
-- process steps, and pricing packages (with their own feature child table).

-- ─── solutions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.solutions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  slug              text NOT NULL UNIQUE,
  summary           text,
  body              text,
  icon              text,
  published         boolean NOT NULL DEFAULT false,
  category          text,
  short_description text,
  long_description  text,
  image             text,
  sort_order        int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;

-- Public can read published solutions
CREATE POLICY "public read solutions"
  ON public.solutions FOR SELECT
  USING (published = true);

-- Admins can manage all solutions
CREATE POLICY "admins full access solutions"
  ON public.solutions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS solutions_slug_idx       ON public.solutions (slug);
CREATE INDEX IF NOT EXISTS solutions_published_idx  ON public.solutions (published);
CREATE INDEX IF NOT EXISTS solutions_sort_order_idx ON public.solutions (sort_order);

CREATE TRIGGER set_updated_at_solutions
  BEFORE UPDATE ON public.solutions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── solution_features ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.solution_features (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  feature     text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

ALTER TABLE public.solution_features ENABLE ROW LEVEL SECURITY;

-- Public can read features whose parent solution is published
CREATE POLICY "public read solution_features"
  ON public.solution_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.solutions s
      WHERE s.id = solution_features.solution_id
        AND s.published = true
    )
  );

-- Admins can manage all solution_features
CREATE POLICY "admins full access solution_features"
  ON public.solution_features FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS solution_features_solution_id_idx ON public.solution_features (solution_id);

-- ─── solution_technologies ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.solution_technologies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  technology  text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

ALTER TABLE public.solution_technologies ENABLE ROW LEVEL SECURITY;

-- Public can read technologies whose parent solution is published
CREATE POLICY "public read solution_technologies"
  ON public.solution_technologies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.solutions s
      WHERE s.id = solution_technologies.solution_id
        AND s.published = true
    )
  );

-- Admins can manage all solution_technologies
CREATE POLICY "admins full access solution_technologies"
  ON public.solution_technologies FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS solution_technologies_solution_id_idx ON public.solution_technologies (solution_id);

-- ─── solution_services ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.solution_services (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id  uuid NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  sort_order   int NOT NULL DEFAULT 0
);

ALTER TABLE public.solution_services ENABLE ROW LEVEL SECURITY;

-- Public can read services whose parent solution is published
CREATE POLICY "public read solution_services"
  ON public.solution_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.solutions s
      WHERE s.id = solution_services.solution_id
        AND s.published = true
    )
  );

-- Admins can manage all solution_services
CREATE POLICY "admins full access solution_services"
  ON public.solution_services FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS solution_services_solution_id_idx ON public.solution_services (solution_id);

-- ─── solution_process_steps ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.solution_process_steps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  step        text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

ALTER TABLE public.solution_process_steps ENABLE ROW LEVEL SECURITY;

-- Public can read process steps whose parent solution is published
CREATE POLICY "public read solution_process_steps"
  ON public.solution_process_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.solutions s
      WHERE s.id = solution_process_steps.solution_id
        AND s.published = true
    )
  );

-- Admins can manage all solution_process_steps
CREATE POLICY "admins full access solution_process_steps"
  ON public.solution_process_steps FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS solution_process_steps_solution_id_idx ON public.solution_process_steps (solution_id);

-- ─── solution_pricing_packages ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.solution_pricing_packages (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id  uuid NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  package_name text NOT NULL,
  timeline     text,
  sort_order   int NOT NULL DEFAULT 0
);

ALTER TABLE public.solution_pricing_packages ENABLE ROW LEVEL SECURITY;

-- Public can read pricing packages whose parent solution is published
CREATE POLICY "public read solution_pricing_packages"
  ON public.solution_pricing_packages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.solutions s
      WHERE s.id = solution_pricing_packages.solution_id
        AND s.published = true
    )
  );

-- Admins can manage all solution_pricing_packages
CREATE POLICY "admins full access solution_pricing_packages"
  ON public.solution_pricing_packages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS solution_pricing_packages_solution_id_idx ON public.solution_pricing_packages (solution_id);

-- ─── solution_pricing_package_features ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.solution_pricing_package_features (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.solution_pricing_packages(id) ON DELETE CASCADE,
  feature    text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.solution_pricing_package_features ENABLE ROW LEVEL SECURITY;

-- Public can read package features whose parent package's solution is published
CREATE POLICY "public read solution_pricing_package_features"
  ON public.solution_pricing_package_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.solution_pricing_packages p
      JOIN public.solutions s ON s.id = p.solution_id
      WHERE p.id = solution_pricing_package_features.package_id
        AND s.published = true
    )
  );

-- Admins can manage all solution_pricing_package_features
CREATE POLICY "admins full access solution_pricing_package_features"
  ON public.solution_pricing_package_features FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS solution_pricing_package_features_package_id_idx
  ON public.solution_pricing_package_features (package_id);
