-- 0019: tech_stack table
-- Technologies/tools displayed in the tech stack section.

CREATE TABLE IF NOT EXISTS public.tech_stack (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  category    text,
  logo        text,
  sort_order  int NOT NULL DEFAULT 0,
  published   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tech_stack ENABLE ROW LEVEL SECURITY;

-- Public can read published tech stack entries
CREATE POLICY "public read published tech_stack"
  ON public.tech_stack FOR SELECT
  USING (published = true);

-- Admins can manage all tech stack entries
CREATE POLICY "admins full access tech_stack"
  ON public.tech_stack FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS tech_stack_sort_order_idx ON public.tech_stack (sort_order);
CREATE INDEX IF NOT EXISTS tech_stack_category_idx ON public.tech_stack (category);
CREATE INDEX IF NOT EXISTS tech_stack_published_idx ON public.tech_stack (published);

-- Trigger: auto-update updated_at on row change
CREATE TRIGGER set_updated_at_tech_stack
  BEFORE UPDATE ON public.tech_stack
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
