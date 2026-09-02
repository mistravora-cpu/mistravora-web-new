-- 0011: pricing_notes table
-- Notes displayed below the pricing tiers (e.g. disclaimers, terms).

CREATE TABLE IF NOT EXISTS public.pricing_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text        text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pricing_notes ENABLE ROW LEVEL SECURITY;

-- Public can read active pricing notes
CREATE POLICY "public read active pricing_notes"
  ON public.pricing_notes FOR SELECT
  USING (active = true);

-- Admins can manage all pricing notes
CREATE POLICY "admins full access pricing_notes"
  ON public.pricing_notes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS pricing_notes_sort_order_idx ON public.pricing_notes (sort_order);
CREATE INDEX IF NOT EXISTS pricing_notes_active_idx ON public.pricing_notes (active);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_pricing_notes
  BEFORE UPDATE ON public.pricing_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
