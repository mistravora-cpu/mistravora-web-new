-- 0029: media_library table
-- Centralized media asset metadata for images and files.

CREATE TABLE IF NOT EXISTS public.media_library (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  alt_text   text,
  note       text,
  url        text NOT NULL,
  file_key   text NOT NULL,
  file_type  text,
  file_size  bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Public can read all media
CREATE POLICY "public read media_library"
  ON public.media_library FOR SELECT
  USING (true);

-- Admins can manage all media
CREATE POLICY "admins full access media_library"
  ON public.media_library FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_media_library
  BEFORE UPDATE ON public.media_library
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
