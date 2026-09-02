-- 0027: inquiries table
-- Contact form submissions. Immutable except for status updates by admins.

CREATE TABLE IF NOT EXISTS public.inquiries (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  phone      text,
  company    text,
  message    text NOT NULL,
  status     text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','replied')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Public can submit inquiries (INSERT only)
CREATE POLICY "public insert inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

-- Admins can manage all inquiries
CREATE POLICY "admins full access inquiries"
  ON public.inquiries FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS inquiries_created_at_idx ON public.inquiries (created_at DESC);

-- Note: No updated_at trigger; inquiries are immutable except status.
