import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const { PGlite } = await import(
  process.env.PGLITE_MODULE || "@electric-sql/pglite"
);
const db = new PGlite();
try {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create function auth.uid() returns uuid language sql as $$ select null::uuid $$;
    create function public.is_admin() returns boolean language sql as $$ select coalesce(current_setting('test.admin', true), '') = 'true' $$;
    create function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
  `);
  for (const file of ["0027_inquiries.sql", "0028_newsletter_subscribers.sql"])
    await db.exec(
      readFileSync(
        new URL(`../supabase/migrations/${file}`, import.meta.url),
        "utf8",
      ),
    );
  for (const table of [
    "posts",
    "research",
    "services",
    "knowledge_base",
    "glossary_terms",
    "solutions",
    "case_studies",
    "policies",
  ])
    await db.exec(
      `create table public.${table} (id uuid primary key default gen_random_uuid(), title text, published boolean default false, published_at timestamptz);`,
    );
  await db.exec(
    'alter table research enable row level security; create policy "public read published research" on research for select using (published);',
  );
  await db.exec(
    readFileSync(
      new URL(
        "../supabase/migrations/0039_marketing_platform.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  await db.exec(
    "grant usage on schema public to anon,authenticated,service_role; grant all on all tables in schema public to anon,authenticated,service_role;",
  );
  const slot = (
    await db.query(
      "insert into booking_slots(starts_at,ends_at) values (now()+interval '1 day',now()+interval '1 day 30 minutes') returning id",
    )
  ).rows[0].id;
  await db.exec("set role anon;");
  assert.equal((await db.query("select * from booking_slots")).rows.length, 1);
  assert.equal((await db.query("select * from bookings")).rows.length, 0);
  await assert.rejects(
    db.query(
      "select reserve_consultation($1,'Test Person','test@example.com','')",
      [slot],
    ),
    /permission denied/,
  );
  await db.exec("reset role; set role service_role;");
  const booking = (
    await db.query(
      "select reserve_consultation($1,'Test Person','test@example.com','Planning') as id",
      [slot],
    )
  ).rows[0].id;
  await assert.rejects(
    db.query(
      "select reserve_consultation($1,'Other Person','other@example.com','')",
      [slot],
    ),
    /Slot unavailable/,
  );
  await db.exec("reset role; set role anon;");
  assert.equal((await db.query("select * from booking_slots")).rows.length, 0);
  assert.equal((await db.query("select * from bookings")).rows.length, 0);
  await assert.rejects(
    db.query(
      "insert into inquiries(name,email,message,lead_stage) values('Bot','bot@example.com','A long enough message','won')",
    ),
    /row-level security/,
  );
  await db.exec("reset role;");
  await db.query("update bookings set status='cancelled' where id=$1", [
    booking,
  ]);
  assert.equal(
    (await db.query("select available from booking_slots where id=$1", [slot]))
      .rows[0].available,
    true,
  );
  const post = (
    await db.query("insert into posts(title) values ('Original') returning id")
  ).rows[0].id;
  await db.query("update posts set title='Revised' where id=$1", [post]);
  assert.equal(
    (
      await db.query(
        "select previous_data from content_revisions where record_id=$1",
        [post],
      )
    ).rows[0].previous_data.title,
    "Original",
  );
  await db.exec(
    "alter table posts enable row level security; insert into posts(title,published,published_at) values ('Future',true,now()+interval '1 day'),('Live',true,now()-interval '1 day'); set role anon;",
  );
  assert.equal((await db.query("select * from posts")).rows.length, 1);
  await db.exec(
    "reset role; insert into research(title,published,published_at) values ('Future research',true,now()+interval '1 day'); set role anon;",
  );
  assert.equal((await db.query("select * from research")).rows.length, 0);
  await db.exec("reset role;");
  await db.exec(
    "insert into newsletter_subscribers(email,status) select 'subscriber'||n||'@example.com','active' from generate_series(1,1005) n;",
  );
  const campaign = (
    await db.query(
      "insert into email_campaigns(title,subject,body,status,scheduled_at) values ('Test','Subject','Message','scheduled',now()) returning id",
    )
  ).rows[0].id;
  await db.exec("set role anon;");
  await assert.rejects(
    db.query("select queue_email_campaign($1)", [campaign]),
    /permission denied/,
  );
  await db.exec("reset role; set role service_role;");
  await db.query("select queue_email_campaign($1)", [campaign]);
  await db.query("select queue_email_campaign($1)", [campaign]);
  assert.equal(
    (
      await db.query(
        "select count(*)::int as count from email_deliveries where campaign_id=$1",
        [campaign],
      )
    ).rows[0].count,
    1005,
  );
  await assert.rejects(
    db.query("update email_campaigns set body='Changed' where id=$1", [
      campaign,
    ]),
    /new campaign/,
  );
  await db.query("update email_campaigns set status='paused' where id=$1", [
    campaign,
  ]);
  await db.query("select queue_email_campaign($1)", [campaign]);
  assert.equal(
    (
      await db.query("select status from email_campaigns where id=$1", [
        campaign,
      ])
    ).rows[0].status,
    "paused",
  );
  console.log(
    "PASS: email audience beyond 1,000, idempotent queue, server-only access, immutable content and pause preservation.",
  );
  console.log(
    "PASS: migration, private booking data, server-only reservations, duplicate prevention, cancellation release, CRM RLS, and content revisions.",
  );
} finally {
  await db.close();
}
