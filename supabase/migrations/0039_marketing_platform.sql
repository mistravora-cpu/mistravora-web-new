-- Custom CRM, booking, SEO controls, campaign delivery, and audit history.
-- Apply after 0038. No existing content is removed.
begin;
alter table public.inquiries
  add column if not exists lead_type text not null default 'inquiry',
  add column if not exists service text,
  add column if not exists budget text,
  add column if not exists timeline text,
  add column if not exists lead_stage text not null default 'new' check (lead_stage in ('new','qualified','proposal','won','lost')),
  add column if not exists deal_value numeric(14,2) check (deal_value >= 0),
  add column if not exists notes text,
  add column if not exists attribution jsonb,
  add column if not exists updated_at timestamptz not null default now();
drop policy if exists "public insert inquiries" on public.inquiries;
create policy "public insert inquiries" on public.inquiries for insert with check (
  status = 'new' and lead_stage = 'new' and deal_value is null and notes is null
  and length(name) between 2 and 100 and length(message) between 10 and 2000
);

create table public.booking_slots (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null unique,
  ends_at timestamptz not null,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null references public.booking_slots(id),
  name text not null,
  email text not null,
  message text,
  status text not null default 'confirmed' check (status in ('confirmed','completed','cancelled','no_show')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index bookings_active_slot on public.bookings(slot_id) where status <> 'cancelled';
alter table public.booking_slots enable row level security;
alter table public.bookings enable row level security;
create policy "public available slots" on public.booking_slots for select using (available and starts_at > now());
create policy "admin booking slots" on public.booking_slots for all using (public.is_admin()) with check (public.is_admin());
create policy "admin bookings" on public.bookings for all using (public.is_admin()) with check (public.is_admin());

-- Lock the slot to make competing reservations atomic. Attendee data is never public.
create function public.reserve_consultation(p_slot uuid, p_name text, p_email text, p_message text default '') returns uuid
language plpgsql security definer set search_path = public as $$
declare result uuid;
begin
  if length(trim(p_name)) not between 2 and 100 or length(p_email) > 200 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(p_message) > 2000 then
    raise exception 'Invalid booking details';
  end if;
  perform id from public.booking_slots where id = p_slot and available and starts_at > now() + interval '1 hour' for update;
  if not found then raise exception 'Slot unavailable'; end if;
  insert into public.bookings(slot_id,name,email,message) values(p_slot,trim(p_name),lower(trim(p_email)),p_message) returning id into result;
  update public.booking_slots set available = false, updated_at = now() where id = p_slot;
  return result;
end;
$$;
revoke all on function public.reserve_consultation(uuid,text,text,text) from public;
-- Only the application server may reserve; its route enforces rate limits.
grant execute on function public.reserve_consultation(uuid,text,text,text) to service_role;

-- Cancelling an appointment makes its slot available again.
create function public.release_cancelled_slot() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.booking_slots set available = true, updated_at = now() where id = new.slot_id;
  end if;
  return new;
end;
$$;
create trigger release_booking_slot after update on public.bookings for each row execute function public.release_cancelled_slot();

create table public.page_seo (
  id uuid primary key default gen_random_uuid(),
  path text not null unique check (path ~ '^/[a-z0-9/_-]*$'),
  title text not null,
  description text not null,
  canonical text,
  noindex boolean not null default false,
  og_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.page_seo enable row level security;
create policy "public seo read" on public.page_seo for select using (true);
create policy "admin seo" on public.page_seo for all using (public.is_admin()) with check (public.is_admin());

create table public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft','scheduled','sending','sent','paused')),
  scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.email_campaigns(id) on delete cascade,
  subscriber_id uuid not null references public.newsletter_subscribers(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed','skipped')),
  provider_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(campaign_id,subscriber_id)
);
alter table public.email_campaigns enable row level security;
alter table public.email_deliveries enable row level security;
create policy "admin campaigns" on public.email_campaigns for all using (public.is_admin()) with check (public.is_admin());
create policy "admin deliveries" on public.email_deliveries for all using (public.is_admin()) with check (public.is_admin());

create table public.content_revisions (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid not null,
  previous_data jsonb not null,
  changed_by uuid,
  created_at timestamptz not null default now()
);
alter table public.content_revisions enable row level security;
create policy "admin revisions" on public.content_revisions for select using (public.is_admin());
create function public.record_content_revision() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.content_revisions(table_name,record_id,previous_data,changed_by) values(TG_TABLE_NAME,old.id,to_jsonb(old),auth.uid());
  if TG_OP = 'DELETE' then return old; end if;
  return new;
end;
$$;
do $$ declare t text; begin
  foreach t in array array['posts','research','services','knowledge_base','glossary_terms','solutions','case_studies','policies','page_seo'] loop
    execute format('create trigger record_revision before update or delete on public.%I for each row execute function public.record_content_revision()',t);
  end loop;
end $$;
-- Scheduled editorial content remains private even through the public database API.
drop policy if exists "public read published research" on public.research;
do $$ declare t text; begin
  foreach t in array array['posts','research','knowledge_base'] loop
    execute format('drop policy if exists %I on public.%I', 'public read ' || t, t);
    execute format('create policy %I on public.%I for select using (published and (published_at is null or published_at <= now()))', 'public read ' || t, t);
  end loop;
end $$;

-- Take one audience snapshot, without a client-side row limit. A row lock
-- makes overlapping cron invocations safe.
create or replace function public.queue_email_campaign(campaign uuid)
returns void language plpgsql security definer set search_path = public as $$
declare current_status text;
begin
  select status into current_status from public.email_campaigns where id = campaign for update;
  if current_status <> 'scheduled' or current_status is null then return; end if;
  if not exists (select 1 from public.email_deliveries where campaign_id = campaign) then
  insert into public.email_deliveries (campaign_id, subscriber_id)
    select campaign, id from public.newsletter_subscribers where status = 'active'
    on conflict (campaign_id, subscriber_id) do nothing;
  end if;
  update public.email_campaigns set status = 'sending' where id = campaign;
end;
$$;
revoke all on function public.queue_email_campaign(uuid) from public, anon, authenticated;
grant execute on function public.queue_email_campaign(uuid) to service_role;

-- Once delivery starts, preserve the reviewed payload and audience. Pausing
-- and resuming is supported, but edits require a new draft campaign.
create or replace function public.guard_campaign_payload()
returns trigger language plpgsql set search_path = public as $$
begin
  if exists (select 1 from public.email_deliveries where campaign_id = old.id)
    and (new.subject is distinct from old.subject or new.body is distinct from old.body) then
    raise exception 'Create a new campaign to change content after delivery has started';
  end if;
  return new;
end;
$$;
create trigger guard_campaign_payload before update on public.email_campaigns
for each row execute function public.guard_campaign_payload();

commit;
