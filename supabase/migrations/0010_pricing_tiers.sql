-- 0010: pricing_tiers table + pricing_tier_features child table
-- Pricing tiers displayed on the pricing page, with individual features.

-- ─── pricing_tiers ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  tagline     text,
  price       text,
  description text,
  icon        text,
  button_text text,
  sort_order  int NOT NULL DEFAULT 0,
  popular     boolean NOT NULL DEFAULT false,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Public can read active pricing tiers
CREATE POLICY "public read active pricing_tiers"
  ON public.pricing_tiers FOR SELECT
  USING (active = true);

-- Admins can manage all pricing tiers
CREATE POLICY "admins full access pricing_tiers"
  ON public.pricing_tiers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS pricing_tiers_sort_order_idx ON public.pricing_tiers (sort_order);
CREATE INDEX IF NOT EXISTS pricing_tiers_active_idx ON public.pricing_tiers (active);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_pricing_tiers
  BEFORE UPDATE ON public.pricing_tiers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── pricing_tier_features ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pricing_tier_features (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pricing_tier_id  uuid NOT NULL REFERENCES public.pricing_tiers(id) ON DELETE CASCADE,
  feature          text NOT NULL,
  sort_order       int NOT NULL DEFAULT 0
);

ALTER TABLE public.pricing_tier_features ENABLE ROW LEVEL SECURITY;

-- Public can read features whose parent tier is active
CREATE POLICY "public read active pricing_tier_features"
  ON public.pricing_tier_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pricing_tiers pt
      WHERE pt.id = pricing_tier_features.pricing_tier_id
        AND pt.active = true
    )
  );

-- Admins can manage all pricing tier features
CREATE POLICY "admins full access pricing_tier_features"
  ON public.pricing_tier_features FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
