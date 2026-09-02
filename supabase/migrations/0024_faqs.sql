-- 0024: faqs table
-- Frequently asked questions grouped by page.

CREATE TABLE IF NOT EXISTS public.faqs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page       text NOT NULL DEFAULT 'general',
  question   text NOT NULL,
  answer     text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  published  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Public can read published FAQs
CREATE POLICY "public read published faqs"
  ON public.faqs FOR SELECT
  USING (published = true);

-- Admins can manage all FAQs
CREATE POLICY "admins full access faqs"
  ON public.faqs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS faqs_page_idx ON public.faqs (page);
CREATE INDEX IF NOT EXISTS faqs_sort_order_idx ON public.faqs (sort_order);
CREATE INDEX IF NOT EXISTS faqs_published_idx ON public.faqs (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_faqs
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
