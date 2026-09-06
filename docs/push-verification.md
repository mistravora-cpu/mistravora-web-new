# Pre-push verification — 6 September 2026

Destination: `https://github.com/mistravora-cpu/mistravora-web-new.git`, branch `main`.
Git identity: `mistravora-git <mistravora@gmail.com>` (global configuration).

Checks against the current local production build:

- ESLint: passed without warnings.
- Unit tests: all 8 passed.
- TypeScript (`npx tsc --noEmit`): passed.
- Production build: passed, 82 generated pages.
- npm dependency audit: 0 reported vulnerabilities.
- Local PGlite migration/security verification: passed, including booking privacy, reservation collisions, CRM access rules, campaign audience/queue behavior and content revisions.
- Browser business verification: confirmed company data and 11 services; automatic robot canvas; no public requests to admin routes; 16 loaded application scripts checked for the actual service-role secret and tested admin UI markers; unauthenticated dashboard request redirected with status 307.
- Public smoke check: 9 routes returned 200, consent checks passed, intended missing route returned 404, no application JavaScript exceptions.
- Repository candidate files scanned for configured private environment credentials and common credential signatures: no matches. This is a targeted scan, not a guarantee against every possible secret format.
- Whitespace/error-marker check: `git diff --check` passed.

The automated browser logged software-GPU ReadPixels diagnostics during capture and a resource error for the deliberately requested 404. These are retained in the report rather than suppressed. No application exception occurred.

Local database snapshots, screenshots, raw Lighthouse reports and the raw public-content dump are ignored by Git. Small verification summaries, source code, migrations and content documents are included.

Scope limits: pushing code does not verify deployment. Migration 0039 and production campaign/booking configuration still require the setup described in the project documentation; local migration tests do not apply it to Supabase. The completed content brief contains proposals and unresolved owner decisions, not newly published records. Existing project seed claims need the factual review documented in that brief. No fresh Lighthouse score is claimed by this verification.
