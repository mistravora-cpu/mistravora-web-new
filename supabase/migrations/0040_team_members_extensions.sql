-- 0040: team_members extensions
-- Adds employment category, department, location, expertise, and additional
-- social/contact fields so the About page can group members into sections
-- (Senior staff, Permanent staff, Interns, ...) and show richer profiles.
--
-- Category is a free-form text column (kept flexible to match the rest of the
-- schema, e.g. solutions.category, tech_stack.category). The application layer
-- normalizes a small set of known categories (senior, permanent, intern,
-- advisor, contractor) and falls back to a generic "Team" bucket for any
-- other value, so adding new categories later requires no migration.

-- ─── schema changes ──────────────────────────────────────────────────────
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS category   text NOT NULL DEFAULT 'permanent',
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS location   text,
  ADD COLUMN IF NOT EXISTS expertise  text,
  ADD COLUMN IF NOT EXISTS github     text,
  ADD COLUMN IF NOT EXISTS instagram  text,
  ADD COLUMN IF NOT EXISTS facebook   text,
  ADD COLUMN IF NOT EXISTS website    text,
  ADD COLUMN IF NOT EXISTS email      text;

-- Index category for grouped reads on the About page.
CREATE INDEX IF NOT EXISTS team_members_category_idx
  ON public.team_members (category);

-- ─── backfill seed rows with sensible categories ─────────────────────────
-- These names come from 0037_seed_content.sql. The seed uses
-- ON CONFLICT DO NOTHING, so these UPDATEs only fire if those rows exist;
-- otherwise they are no-ops. Fatima keeps the 'permanent' default.
UPDATE public.team_members
  SET category = 'senior'
  WHERE name IN ('Shakeel', 'Sarah', 'Ahmed')
    AND category = 'permanent';
