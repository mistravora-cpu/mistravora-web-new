-- 0028: newsletter_subscribers table
-- Email subscriptions for the newsletter.

CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text NOT NULL UNIQUE,
  status     text NOT NULL DEFAULT 'active' CHECK (status IN ('active','unsubscribed','bounced')),
  source     text DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can subscribe (INSERT only)
CREATE POLICY "public insert newsletter_subscribers"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Admins can manage all newsletter subscribers
CREATE POLICY "admins full access newsletter_subscribers"
  ON public.newsletter_subscribers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON public.newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx ON public.newsletter_subscribers (status);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_newsletter_subscribers
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
