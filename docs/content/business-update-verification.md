# Business essentials update

Verified Supabase project: `ghixwjdxzrovdmdzocxj`.
Both public and server Supabase URLs identify this project. Mistravora's name, phone number and seven expected clients were checked before writes. The update script refuses any other project.

## Saved remotely

- 21 public business settings: positioning, founder Husni, Co-Founder Shakeel, founding month May 2025, Sri Lanka base, unrestricted markets and industries, customer types, offerings, and enquiry availability/response expectation.
- Contact: info@mistravora.com, +94 77 330 6063, Sri Lanka; available 24/7 for enquiries with responses within 24 hours.
- Four hero records, 11 published service records, and founder team roles.
- Existing prices, customer records, bookings, subscribers and email deliveries were not changed.
- A backup of the affected public records and the write result are in this directory. The service descriptions only summarize the supplied offerings; no project prices, performance promises or unconfirmed deliverables were added.

## Where to edit

- **Dashboard → Settings → Business profile:** company facts, homepage heading/introduction, markets, customers, offerings and response expectation.
- **Dashboard → Contact:** email, phone, WhatsApp and address. This is the authoritative contact source across the updated public surfaces.
- **Dashboard → Services:** the 11 published services and their detail-page content.
- **Dashboard → About:** founder/team roles.
- **Dashboard → Hero:** About, Contact and Industries page introductions. Homepage profile copy is explicitly edited in Business profile.

Public rendering reads Supabase on the server. It uses a five-minute cache for performance; successful admin saves invalidate the public-data cache and public layout. Direct Supabase edits refresh through the cache interval. This is editable CMS content, not a rebuild-only content source. No browser request to load the admin application is needed to read business content.

New source-code wiring is local and must be deployed to affect the hosted application. Remote content updates are already saved.

## Checks completed

- Read-back confirmed settings, founders, 11 services and contact details in the verified project.
- Production build, TypeScript, ESLint and eight unit/regression tests passed.
- Production dependency audit: zero reported vulnerabilities at check time.
- Anonymous queries returned no admin-user, inquiry or subscriber rows.
- Public profile serialization uses an explicit field allowlist; unknown keys and secret-like settings are excluded and regression-tested.
- Removed the CAPI secret-token input/write key from the publicly readable settings workflow. No populated sensitive settings were found during the scoped read. This does not replace a complete policy review of future keys added directly to the database.
- Added identifier validation for script-interpolated marketing IDs, contact email/phone validation, bounded setting values, and founding-month validation.
- Admin authorization remains enforced in middleware/layout and mutation actions. Dashboard/login responses carry private no-store and noindex headers.
- Clean mobile browser: automatic 3D canvas, no horizontal overflow, no application exceptions, updated facts on public pages.
- Home browsing requested no admin/dashboard URLs. Sixteen loaded client scripts were scanned: no actual service-role key and no tested admin-editor markers.
- Anonymous dashboard request redirected to login with HTTP 307 and no-store caching.

These are scoped application and dependency checks, not a penetration-test certification. Authenticated admin editing was not automated with a real account; the relevant save paths and invalidation were reviewed in source. No emails or messages were sent.

Machine-readable browser results: [business-security.json](../audits/business-security.json).
