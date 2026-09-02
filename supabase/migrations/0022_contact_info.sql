-- 0022: contact_info table
-- Contact details displayed on the contact page.

CREATE TABLE IF NOT EXISTS public.contact_info (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline    text NOT NULL DEFAULT 'Get in Touch',
  description text,
  address     text,
  email       text,
  phone       text,
  whatsapp    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- Public can read all contact info
CREATE POLICY "public read contact_info"
  ON public.contact_info FOR SELECT
  USING (true);

-- Admins can manage all contact info
CREATE POLICY "admins full access contact_info"
  ON public.contact_info FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_contact_info
  BEFORE UPDATE ON public.contact_info
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
