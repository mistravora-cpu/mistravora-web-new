-- 0041: team_members.slug
-- Adds an optional, unique slug so each team member can have a dedicated
-- profile page (e.g. /about/team/shakeel). Backfilled from the member name.
-- The application falls back to a name-derived slug when this column is NULL,
-- so the column is nullable to keep inserts simple.

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS slug text;

-- Unique index allows multiple NULLs (Postgres default) while enforcing
-- uniqueness for any explicitly set slug.
CREATE UNIQUE INDEX IF NOT EXISTS team_members_slug_key
  ON public.team_members (slug);

-- Backfill slug from name: lowercase, replace non-alphanumerics with hyphens,
-- trim leading/trailing hyphens, coalesce empty to NULL.
UPDATE public.team_members
  SET slug = NULLIF(
    btrim(
      lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')),
      '-'
    ),
    ''
  )
  WHERE slug IS NULL;

CREATE INDEX IF NOT EXISTS team_members_slug_idx
  ON public.team_members (slug);
