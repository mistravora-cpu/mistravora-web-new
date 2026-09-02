-- 0017: testimonials table
-- Customer testimonials displayed on the landing page.

CREATE TABLE IF NOT EXISTS public.testimonials (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote       text NOT NULL,
  name        text NOT NULL,
  role        text NOT NULL,
  avatar      text,
  rating      int NOT NULL DEFAULT 5,
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read published testimonials
CREATE POLICY "public read published testimonials"
  ON public.testimonials FOR SELECT
  USING (published = true);

-- Admins can manage all testimonials
CREATE POLICY "admins full access testimonials"
  ON public.testimonials FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS testimonials_sort_order_idx ON public.testimonials (sort_order);
CREATE INDEX IF NOT EXISTS testimonials_published_idx ON public.testimonials (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_testimonials
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
