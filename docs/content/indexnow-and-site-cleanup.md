# IndexNow and site cleanup — September 2026

## Implemented

- The owner-supplied IndexNow ownership key is served by `public/243cc496d6764d31a932e95206a2eacc.txt`. This key is deliberately public, not a server credential.
- Successful admin content writes schedule a server-side IndexNow notification after the response. Published detail URLs are captured before and after edits so renaming, unpublishing and deletion can notify search engines about the previous URL. Industry archival and scheduled publication rules match the existing database schema.
- Only canonical HTTPS public paths on `www.mistravora.com` are submitted. Private records, operational tables, preview deployments, query strings and foreign URLs are excluded. There is no visitor-side IndexNow script.
- **Dashboard → Marketing & SEO → IndexNow notifications** shows the most recently recorded result and provides **Submit published URLs**. It requires an authenticated administrator, uses a one-minute cooldown, verifies the live ownership file before submission, and distinguishes receipt from indexing.
- A manual retry includes URLs from the most recent failed submission plus the current published sitemap. Results and their public URL lists use the existing Supabase `settings` table. No private inquiry or subscriber data is stored in this status.
- Notifications are best-effort background work, not a durable delivery queue. Check the status after saving; there is no scheduled automatic retry. A newer attempt replaces the last-result record. Direct database edits and articles whose future publication time arrives without an admin save need a manual submission. The sitemap remains available for normal discovery.

## Bing report

The supplied text identified `/industries`, `/careers` and `/blog/business-process-automation-guide` on the older apex host. The Downloads CSV was not present at its supplied path, so additional CSV rows could not be reviewed.

- Industries and Careers already define distinct titles and descriptions. The Industries fallback now describes the services and broad industry coverage more clearly, while keeping admin overrides.
- The live project currently lacks `page_seo`. Migration `0043_legacy_page_seo.sql` creates this table if missing, with public reads and admin-only writes protected by row-level security. On deployments that already have it, the migration replaces only the exact obsolete description quoted in the report, if present on those paths. It preserves newer editorial copy, canonical choices, and noindex settings. It does not create or publish an article.
- A privileged, read-only database check confirmed that the reported blog slug has no row in `posts`. Unavailable articles now have explicit not-found metadata and noindex. Published articles use plain text from their excerpt, then their body, then a title-specific fallback. The actual article must be created and published in the admin if it should be available; an unrelated redirect would conceal the missing content.
- The content-audit script now sends Bing's crawler user agent and inspects metadata inside `<head>`. It also detects duplicate descriptions and sitemap pages marked noindex. Short descriptions are editorial notes, not an invented hard ranking requirement.
- Next.js already includes Bingbot in its blocking-metadata defaults. Those defaults were retained so visitors can still benefit from streamed metadata.

The backlink warning cannot be repaired with a website code change. Use approved customer case studies, useful original articles and genuine business listings; ask willing customers or partners to cite the appropriate page. Do not buy links or manufacture endorsements. No outreach messages have been sent.

## Robot and cleanup

The robot has its own responsive visual area, stationary background lighting, and an added light on its body. Overlapping fades no longer obscure it in dark mode. Both scale and movement limits account for canvas width and height, with movement coordinates converted into the scaled group's local space. Removed the clipped black shadow plane found during screenshot review. Automatic startup, interaction, tab visibility handling and the earlier render-loop fix remain in place.

Removed the unused gradient-orbs/social-proof modules and overlapping scroll hint. Insights now links to collections with published entries and connects the existing admin-controlled newsletter form. Improved empty-page navigation, mobile search forms, newsletter labels/status/timeout handling, same-page hero links and malformed author-link handling.

## Deployment checklist

1. Complete verification and deploy the changes to the existing production project.
2. Apply `supabase/migrations/0043_legacy_page_seo.sql` to the verified Mistravora database (`ghixwjdxzrovdmdzocxj`), then invalidate public CMS cache using an admin content save.
3. Confirm the root ownership file returns HTTP 200 and the exact key as plain text at the canonical host. The admin submission checks this itself.
4. On the production admin, choose **Submit published URLs**. HTTP 200 means received; HTTP 202 means key validation is pending. Check IndexNow reporting in Bing Webmaster Tools after processing.
5. Run `AUDIT_URL=https://www.mistravora.com npm run audit:content` and start a fresh Bing Site Scan. Inspect the reported article separately: publish real content if wanted, otherwise retain its not-found response.
6. Recheck the robot in light/dark themes and on mobile, including theme clicks, menu clicks and returning from other pages.

No successful live submission or database migration is implied by the source changes. See the completion report for checks actually run and any deployment restrictions.

## Local verification — 16 September 2026

- 130 automated tests pass; ESLint with `--max-warnings=0`, TypeScript including unused-local/parameter checks, and the full production build pass.
- All 58 current sitemap URLs pass the Bing-user-agent checks for status, head title/description/canonical, unique metadata and a single H1. Some service/industry descriptions remain short because the source content is short; the audit records these as editorial notes. A new published research article appeared during verification and is included in the latest count.
- Desktop and mobile browser checks pass repeated theme changes, hero clicks, cookie-dialog dismissal, mobile menu use, resize, returning from Pricing and resuming after scrolling back. No browser errors/warnings or horizontal overflow were observed. Mobile used four-times CPU throttling. Screenshots were inspected in light and dark themes.
- A source dependency scan found no unreachable modules among 228 source files and 96 Next entry points.
- Lighthouse results and their different throttling configurations are recorded in `docs/audits/indexnow-cleanup-verification.json`; they are local measurements, not a guarantee for the deployed site or every connection.
- The deeper internal-link crawl was not completed: automatic approval review rejected that command because of an approval-service usage limit. The independent sitemap and browser checks above completed successfully.
- The Supabase CLI has no management access token, so the missing SEO table migration remains pending the owner's CLI login or SQL Editor action. Public metadata and IndexNow do not require that optional table; the Page SEO editor does.

References: [IndexNow protocol](https://www.indexnow.org/documentation), [Bing Site Scan](https://www.bing.com/webmasters/help/site-scan-623520c9), [Next.js crawler metadata behavior](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots), [Next.js background work](https://nextjs.org/docs/app/api-reference/functions/after).
