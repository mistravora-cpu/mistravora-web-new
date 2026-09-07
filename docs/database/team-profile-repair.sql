-- Run only in Supabase project ghixwjdxzrovdmdzocxj.
-- Additive repair: preserves all existing profile facts and publication states.
BEGIN;
ALTER TABLE public.team_members
 ADD COLUMN IF NOT EXISTS slug text,
 ADD COLUMN IF NOT EXISTS category text,
 ADD COLUMN IF NOT EXISTS department text,
 ADD COLUMN IF NOT EXISTS location text,
 ADD COLUMN IF NOT EXISTS expertise text,
 ADD COLUMN IF NOT EXISTS github text,
 ADD COLUMN IF NOT EXISTS instagram text,
 ADD COLUMN IF NOT EXISTS facebook text,
 ADD COLUMN IF NOT EXISTS website text,
 ADD COLUMN IF NOT EXISTS email text;
-- No name-based backfill: duplicate names must not break the migration or
-- silently assign employment categories. The application provides slug fallbacks.
CREATE UNIQUE INDEX IF NOT EXISTS team_members_slug_key ON public.team_members(slug);
NOTIFY pgrst, 'reload schema';
COMMIT;
