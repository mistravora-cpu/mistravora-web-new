-- 0016: core_values table
-- Company core values displayed on the about page.

CREATE TABLE IF NOT EXISTS public.core_values (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon        text NOT NULL DEFAULT 'Target',
  title       text NOT NULL,
  description text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.core_values ENABLE ROW LEVEL SECURITY;

-- Public can read published core values
CREATE POLICY "public read published core_values"
  ON public.core_values FOR SELECT
  USING (published = true);

-- Admins can manage all core values
CREATE POLICY "admins full access core_values"
  ON public.core_values FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS core_values_sort_order_idx ON public.core_values (sort_order);
CREATE INDEX IF NOT EXISTS core_values_published_idx ON public.core_values (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_core_values
  BEFORE UPDATE ON public.core_values
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
