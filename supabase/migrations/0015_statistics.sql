-- 0015: statistics table
-- Key metrics/statistics displayed on the landing page.

CREATE TABLE IF NOT EXISTS public.statistics (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value       text NOT NULL,
  label       text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

-- Public can read published statistics
CREATE POLICY "public read published statistics"
  ON public.statistics FOR SELECT
  USING (published = true);

-- Admins can manage all statistics
CREATE POLICY "admins full access statistics"
  ON public.statistics FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS statistics_sort_order_idx ON public.statistics (sort_order);
CREATE INDEX IF NOT EXISTS statistics_published_idx ON public.statistics (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_statistics
  BEFORE UPDATE ON public.statistics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
