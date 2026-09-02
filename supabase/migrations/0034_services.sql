-- 0034: services table and child tables
-- Stores individual service pages for SEO/AI discovery (separate from solutions).
-- Child tables replace array columns: features, technologies, FAQs.

-- ─── services ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title        text NOT NULL,
  slug         text NOT NULL UNIQUE,
  tagline      text,
  description  text,
  body         text,
  icon         text,
  category     text,
  cover_image  text,
  sort_order   int NOT NULL DEFAULT 0,
  published    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Public can read published services
CREATE POLICY "public read services"
  ON public.services FOR SELECT
  USING (published = true);

-- Admins can manage all services
CREATE POLICY "admins full access services"
  ON public.services FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS services_slug_idx       ON public.services (slug);
CREATE INDEX IF NOT EXISTS services_published_idx  ON public.services (published);
CREATE INDEX IF NOT EXISTS services_category_idx   ON public.services (category);
CREATE INDEX IF NOT EXISTS services_sort_order_idx ON public.services (sort_order);

CREATE TRIGGER set_updated_at_services
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── service_features ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_features (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id  uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  feature     text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

ALTER TABLE public.service_features ENABLE ROW LEVEL SECURITY;

-- Public can read features whose parent service is published
CREATE POLICY "public read service_features"
  ON public.service_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_features.service_id
        AND s.published = true
    )
  );

-- Admins can manage all service features
CREATE POLICY "admins full access service_features"
  ON public.service_features FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS service_features_service_id_idx ON public.service_features (service_id);

-- ─── service_technologies ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_technologies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id  uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  technology  text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

ALTER TABLE public.service_technologies ENABLE ROW LEVEL SECURITY;

-- Public can read technologies whose parent service is published
CREATE POLICY "public read service_technologies"
  ON public.service_technologies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_technologies.service_id
        AND s.published = true
    )
  );

-- Admins can manage all service technologies
CREATE POLICY "admins full access service_technologies"
  ON public.service_technologies FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS service_technologies_service_id_idx ON public.service_technologies (service_id);

-- ─── service_faqs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_faqs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id  uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  question    text NOT NULL,
  answer      text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0
);

ALTER TABLE public.service_faqs ENABLE ROW LEVEL SECURITY;

-- Public can read FAQs whose parent service is published
CREATE POLICY "public read service_faqs"
  ON public.service_faqs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.services s
      WHERE s.id = service_faqs.service_id
        AND s.published = true
    )
  );

-- Admins can manage all service FAQs
CREATE POLICY "admins full access service_faqs"
  ON public.service_faqs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS service_faqs_service_id_idx ON public.service_faqs (service_id);
