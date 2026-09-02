-- 0008: jobs table
-- Job listings for the careers page.

CREATE TABLE IF NOT EXISTS public.jobs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  location    text,
  type        text,
  description text,
  published   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Public can read published jobs
CREATE POLICY "public read published jobs"
  ON public.jobs FOR SELECT
  USING (published = true);

-- Admins can manage all jobs
CREATE POLICY "admins full access jobs"
  ON public.jobs FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS jobs_published_idx ON public.jobs (published);
CREATE INDEX IF NOT EXISTS jobs_created_at_idx ON public.jobs (created_at DESC);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_jobs
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
