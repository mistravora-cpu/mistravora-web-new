-- 0005: case_studies table and child tables
-- Stores client success stories. Child tables replace array columns:
-- results and technologies.

-- ─── case_studies ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_studies (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  slug             text NOT NULL UNIQUE,
  client           text,
  industry         text,
  location         text,
  date             text,
  problem_statement text,
  solution         text,
  outcome          text,
  body             text,
  cover_image      text,
  published        boolean NOT NULL DEFAULT false,
  sort_order       int NOT NULL DEFAULT 0,
  status           text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

-- Public can read published case studies
CREATE POLICY "public read case_studies"
  ON public.case_studies FOR SELECT
  USING (published = true);

-- Admins can manage all case studies
CREATE POLICY "admins full access case_studies"
  ON public.case_studies FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS case_studies_slug_idx       ON public.case_studies (slug);
CREATE INDEX IF NOT EXISTS case_studies_published_idx  ON public.case_studies (published);
CREATE INDEX IF NOT EXISTS case_studies_status_idx     ON public.case_studies (status);
CREATE INDEX IF NOT EXISTS case_studies_sort_order_idx ON public.case_studies (sort_order);

CREATE TRIGGER set_updated_at_case_studies
  BEFORE UPDATE ON public.case_studies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── case_study_results ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_study_results (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id uuid NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,
  result        text NOT NULL,
  sort_order    int NOT NULL DEFAULT 0
);

ALTER TABLE public.case_study_results ENABLE ROW LEVEL SECURITY;

-- Public can read results whose parent case study is published
CREATE POLICY "public read case_study_results"
  ON public.case_study_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.case_studies c
      WHERE c.id = case_study_results.case_study_id
        AND c.published = true
    )
  );

-- Admins can manage all case_study_results
CREATE POLICY "admins full access case_study_results"
  ON public.case_study_results FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS case_study_results_case_study_id_idx ON public.case_study_results (case_study_id);

-- ─── case_study_technologies ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.case_study_technologies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id uuid NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,
  technology    text NOT NULL,
  sort_order    int NOT NULL DEFAULT 0
);

ALTER TABLE public.case_study_technologies ENABLE ROW LEVEL SECURITY;

-- Public can read technologies whose parent case study is published
CREATE POLICY "public read case_study_technologies"
  ON public.case_study_technologies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.case_studies c
      WHERE c.id = case_study_technologies.case_study_id
        AND c.published = true
    )
  );

-- Admins can manage all case_study_technologies
CREATE POLICY "admins full access case_study_technologies"
  ON public.case_study_technologies FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS case_study_technologies_case_study_id_idx ON public.case_study_technologies (case_study_id);
