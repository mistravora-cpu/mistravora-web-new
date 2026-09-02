-- 0009: benefits table
-- Benefits displayed on the landing/marketing pages.

CREATE TABLE IF NOT EXISTS public.benefits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon        text NOT NULL DEFAULT 'CheckCircle',
  title       text NOT NULL,
  description text,
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.benefits ENABLE ROW LEVEL SECURITY;

-- Public can read published benefits
CREATE POLICY "public read published benefits"
  ON public.benefits FOR SELECT
  USING (published = true);

-- Admins can manage all benefits
CREATE POLICY "admins full access benefits"
  ON public.benefits FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS benefits_sort_order_idx ON public.benefits (sort_order);
CREATE INDEX IF NOT EXISTS benefits_published_idx ON public.benefits (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_benefits
  BEFORE UPDATE ON public.benefits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
