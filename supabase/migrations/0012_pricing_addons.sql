-- 0012: pricing_addons table
-- Optional add-ons displayed on the pricing page.

CREATE TABLE IF NOT EXISTS public.pricing_addons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_addons ENABLE ROW LEVEL SECURITY;

-- Public can read active pricing addons
CREATE POLICY "public read active pricing_addons"
  ON public.pricing_addons FOR SELECT
  USING (active = true);

-- Admins can manage all pricing addons
CREATE POLICY "admins full access pricing_addons"
  ON public.pricing_addons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS pricing_addons_sort_order_idx ON public.pricing_addons (sort_order);
CREATE INDEX IF NOT EXISTS pricing_addons_active_idx ON public.pricing_addons (active);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_pricing_addons
  BEFORE UPDATE ON public.pricing_addons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
