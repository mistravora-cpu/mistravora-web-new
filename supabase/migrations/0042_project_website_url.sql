begin;
alter table public.case_studies add column if not exists website_url text;
comment on column public.case_studies.website_url is 'Optional public website or demo URL. Leave null for confidential systems.';
notify pgrst, 'reload schema';
commit;
