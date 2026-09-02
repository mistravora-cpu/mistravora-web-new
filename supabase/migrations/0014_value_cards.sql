-- 0014: value_cards table
-- Value proposition cards displayed on the landing page.

CREATE TABLE IF NOT EXISTS public.value_cards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon        text NOT NULL DEFAULT 'Clock',
  title       text NOT NULL,
  description text NOT NULL,
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.value_cards ENABLE ROW LEVEL SECURITY;

-- Public can read published value cards
CREATE POLICY "public read published value_cards"
  ON public.value_cards FOR SELECT
  USING (published = true);

-- Admins can manage all value cards
CREATE POLICY "admins full access value_cards"
  ON public.value_cards FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS value_cards_sort_order_idx ON public.value_cards (sort_order);
CREATE INDEX IF NOT EXISTS value_cards_published_idx ON public.value_cards (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_value_cards
  BEFORE UPDATE ON public.value_cards
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
