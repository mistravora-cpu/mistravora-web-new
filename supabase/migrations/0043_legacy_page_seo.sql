-- Repair only the exact obsolete description reported by Bing. Preserve newer
-- admin copy and all custom canonical/noindex decisions. No content is published.
begin;
-- Some existing deployments predate the SEO table in migration 0039. Install
-- only that table here; do not rerun unrelated CRM/email migrations.
do $$ begin
  if to_regclass('public.page_seo') is null then
    create table public.page_seo (
      id uuid primary key default gen_random_uuid(),
      path text not null unique check (path ~ '^/[a-z0-9/_-]*$'),
      title text not null default '',
      description text not null default '',
      canonical text,
      noindex boolean not null default false,
      og_image text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    alter table public.page_seo enable row level security;
    create policy "public seo read" on public.page_seo for select using (true);
    create policy "admin seo" on public.page_seo for all
      using (public.is_admin()) with check (public.is_admin());
    create trigger set_updated_at_page_seo before update on public.page_seo
      for each row execute function public.set_updated_at();
    grant select on public.page_seo to anon;
    grant select, insert, update, delete on public.page_seo to authenticated;
    grant all on public.page_seo to service_role;
  end if;
end $$;

update public.page_seo
set description = case path
  when '/industries' then 'Explore Mistravora software, websites and digital marketing for businesses across industries, with solutions tailored to your workflows and project requirements.'
  when '/careers' then 'Explore current opportunities at Mistravora, a software and digital marketing company based in Sri Lanka and working with clients worldwide.'
  -- Let the published article supply its own excerpt/body metadata. If the
  -- article is unavailable, its route returns the dedicated not-found metadata.
  when '/blog/business-process-automation-guide' then ''
end
where path in ('/industries', '/careers', '/blog/business-process-automation-guide')
  and trim(description) = 'Transform your business with cutting-edge AI solutions. Mistravora delivers innovative technology to drive growth and efficiency.';
commit;
