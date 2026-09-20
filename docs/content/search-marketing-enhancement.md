# Search and marketing enhancement — 20 September 2026

## Initial audit and priorities

Source: supplied 27-section brief; existing implementation inspected before changes. The machine-readable public route audit provides rendered status/title/description/canonical/H1 evidence. Source inspection is not a claim that every admin workflow or external account has been exercised.

| Area | Existing implementation preserved | Gap / next action | Priority |
|---|---|---|---|
| Home | CMS hero, services link, projects, approved reviews, quotation CTA | Requested title/description; Services absent from primary menu | High |
| Services and detail routes | CMS records, HTML/CSS content, primary images, Service schema, related links/FAQs | Review each real service against brief; avoid invented case studies or duplicate pages | Editorial |
| Solutions / industries | CMS catalogs and detail pages, images and enquiry links | Owner-approved use cases and evidence where sparse | Editorial |
| Projects | Screenshots, public links, HTML body, related content, share controls | Verified outcomes, permissions and project-to-service associations | Editorial |
| About / team | Editable team portraits, biographies, profiles | Confirm address formatting before publishing full street address | Owner |
| Contact / booking | Validation, consent, spam controls, rate limits, booking | Confirm Maps listing URL and physical address match Google Business Profile | Owner |
| Pricing / tools | Branching estimator, editable configuration, 30% advance, PDF requests, ROI/audit tools | Preserve pricing; review assumptions periodically | Operational |
| Blog / research | Separate CMS collections, dates, tags, metadata, sharing, related content | Long-article TOC and deeper category filters remain opportunities | Medium |
| Careers | CMS vacancies and applications | Publish only actual vacancies | Editorial |
| Other public routes | Search, authors, glossary, resources, knowledge base, policies, demos, insights, brand | Populate only approved useful records; inspect audit for empty-page notes | Editorial |
| Admin / CRM | RBAC, enquiries, stages, notes, budgets, requirement summaries | Assignment/reminders/deduplication are not a complete CRM; evaluate before expansion | Future |
| Email | Campaigns, worker, subscription/unsubscribe, quotation delivery | Sending-domain SPF/DKIM/DMARC and delivery need provider access | External |
| Analytics | Consent, GA4, CTA/form/lead events, attribution, vitals | WhatsApp destination currently includes phone number; redact contact destinations | High |
| Technical SEO | Canonicals, social cards, sitemap images, robots, breadcrumbs, entity schema, IndexNow | Preserve primary www host; validate external search reports with owner access | High |
| Performance / accessibility | Lazy 3D, reduced motion, optimized media, keyboard controls, labels | New field CWV and physical-device/Lighthouse measurements not yet performed | Verification |

## Implementation plan

1. Correct homepage metadata through existing CMS settings and defaults; preserve visible authored content.
2. Replace the primary Careers slot with Services; retain Careers in footer and existing route.
3. Redact contact destinations from analytics. Match organization address text to the existing public CMS address without inventing address components.
4. Run the public route audit, automated tests, lint, type checking and build. Preserve layout, pricing, databases and integrations.
5. Record unverified external work and a monthly maintenance checklist below. No ads, outreach or campaign sends are authorized by this brief.

## Completion and verification

### Completed and tested

- Homepage metadata: CMS `site_title` is now **Mistravora | Software Development & Digital Solutions**. CMS `site_description` is the exact recommended Sri Lanka/worldwide description from the brief. Both saved and read back from project `ghixwjdxzrovdmdzocxj`. Homepage overrides now use the editable description instead of the shorter visible introduction. Authored hero text was preserved.
- Services added to primary navigation without increasing the menu count. Careers remains available in the footer; every route is retained.
- Organization JSON-LD can now include the existing visible CMS address verbatim. The current database address is only `Sri Lanka`; no detailed street address, map location, rating or office was invented. Stable organization/WebSite identifiers and existing Service/Article/Breadcrumb markup preserved.
- Existing phone/email/WhatsApp event names retained. WhatsApp destinations now report `whatsapp`, excluding phone numbers and query messages; regression test verifies all contact channels. No new trackers or paid campaigns enabled.
- Production audit: 59 sitemap URLs returned 200 with a title, description, matching canonical, one H1 and no duplicate titles/descriptions or noindex conflicts. Random nonexistent blog article returned 404 with noindex. This checks rendered HTML, not Google indexing or rankings.
- Existing automated suite, lint with zero warnings, unused-code TypeScript checks and production build run for this release; separate contact-privacy regression passes. No new runtime dependencies or browser bundles added.

### Files and metadata affected

- `src/lib/business-profile-data.ts`: homepage title/description fallback; CMS values remain authoritative.
- `src/lib/seo-overrides.ts`: homepage description source. Other route metadata unchanged.
- `src/lib/site.ts`, `src/components/site-footer.tsx`: Services/Careers navigation.
- `src/components/json-ld.tsx`: visible CMS address consistency.
- `src/components/marketing-events.tsx`, `tests/marketing-contact-privacy.test.mjs`: privacy correction and regression coverage.
- This report: audit, priorities, scope, follow-up and maintenance.

### Requires external access or owner confirmation

- `page_seo` is absent in the verified database. Migration `0043_legacy_page_seo.sql` remains required for the per-page SEO editor. Global editable homepage SEO works through settings. `0044_posts_sort_order.sql` remains a separate migration task. Supabase SQL-management credentials were not available in the last checked CLI session.
- Confirm the exact street-address format from the brief and existing Google Business Profile/Maps URL before replacing the generic address. Kurunegala positioning is supplied, but the complete address was explicitly conditional on owner confirmation.
- Google Search Console/Bing account reports, sitemap submission in those accounts, field Core Web Vitals, Google Rich Results Test and Schema Markup Validator UI validation were not performed. Existing IndexNow support is preserved; it does not submit to Google.
- Verify SPF, DKIM, DMARC and sending-domain status with the current mail provider. No email campaign, external message or ad was sent.
- New desktop/mobile visual checks, Lighthouse and full authenticated admin end-to-end tests were not performed in this rapid pass. Existing reports are historical, not new performance evidence.

### Recommended subsequent work, not claimed complete

- Review the 11 real service records against the 15 service topics in the brief. Extend relevant existing records for POS/ERP, consulting, support and social media marketing where justified; obtain process details and approved project associations instead of generating thin duplicate pages.
- Article TOCs and visible update dates are implemented in the follow-up below. Richer category filtering and structured citations/methodology still need an editorial/component pass. Preserve Blog and Research as separate collections.
- CRM assignment/reminders, duplicate detection and consented follow-up workflows should follow actual team operations; existing stages, notes, budgets, requirements and email functions already cover the basic workflow.
- Video/dataset/job/product schema only when eligible underlying assets or real records exist. No unsupported schema, fabricated review/metric, foreign office, badge or country doorway page added.
- Existing robots permits both search and training crawlers. This release preserves that choice; obtain an explicit business policy before changing training access. Neither llms.txt nor schema guarantees AI citation.

## Measurement plan (existing events preserved)

Use consented `generate_lead` as the business outcome; distinguish contact and quotation sources through existing safe context. Review `phone_click`, `email_click`, `whatsapp_click`, `cta_click`, `form_start`, `pricing_viewed`, `case_study_viewed`, newsletter/estimator events and `web_vital` as supporting signals. Keep form values, contact destinations and credentials out of analytics. Confirm events in the owner's GA4 account; do not infer successful measurement from code alone.

## Monthly maintenance

1. Review Search Console/Bing indexing, sitemap coverage, queries, conversions and crawl errors; rerun `audit:content`.
2. Review field LCP/INP/CLS, mobile lab results, consent behavior and recent third-party script changes.
3. Refresh service explanations and verified case studies; review broken links, outdated content, author details, metadata and image permissions.
4. Review lead quality, quotation completion, contact failures and consented attribution; test one real approved enquiry through delivery.
5. Review email authentication, bounces/unsubscribes, access permissions and retention; prune obsolete personal data under approved policy.
6. Prioritize one evidence-backed improvement. Do not manufacture reviews, rankings or backlinks.

Reference: [Google's AI search optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide). Search fundamentals and useful original content remain the basis; inclusion and rankings are not guaranteed.

## Rendered public-route audit

Checked 2026-09-20T07:05:26.982Z against https://www.mistravora.com. Pre-deployment baseline. PASS covers the technical checks above, not content completeness or accessibility.

| Route | Result | Editorial note |
|---|---|---|
| / | PASS | — |
| /solutions | PASS | — |
| /industries | PASS | — |
| /pricing | PASS | — |
| /projects | PASS | — |
| /blog | PASS | — |
| /research | PASS | — |
| /about | PASS | — |
| /careers | PASS | — |
| /tools | PASS | — |
| /demos | PASS | — |
| /contact | PASS | Short description (97 characters): review whether it explains the page clearly. |
| /assistant | PASS | — |
| /brand | PASS | Short description (94 characters): review whether it explains the page clearly. |
| /services | PASS | — |
| /insights | PASS | Short description (90 characters): review whether it explains the page clearly. |
| /glossary | PASS | — |
| /knowledge-base | PASS | — |
| /authors | PASS | — |
| /resources | PASS | — |
| /policies | PASS | — |
| /book | PASS | Short description (74 characters): review whether it explains the page clearly. |
| /tools/roi-calculator | PASS | — |
| /tools/website-audit | PASS | — |
| /projects/shopmate-multi-service-marketplace-website-mobile-app | PASS | — |
| /projects/unic-motors-services-pos-inventory-management-system | PASS | — |
| /projects/the-dubai-store-retail-pos-inventory-management-system | PASS | — |
| /projects/tamdrill-global-drilling-solutions-website | PASS | — |
| /projects/amaluna-resorts-booking-system | PASS | — |
| /projects/wijesinghe-jewellers-inventory-pos | PASS | — |
| /projects/assalafiya-book-shop-management | PASS | — |
| /industries/retail | PASS | Short description (94 characters): review whether it explains the page clearly. |
| /industries/hospitality | PASS | Short description (98 characters): review whether it explains the page clearly. |
| /industries/healthcare | PASS | Short description (96 characters): review whether it explains the page clearly. |
| /industries/manufacturing | PASS | Short description (95 characters): review whether it explains the page clearly. |
| /research/pwa-vs-native-apps | PASS | — |
| /research/sri-lanka-smart-bus-fares | PASS | — |
| /research/how-google-ranks-content-displays-websites-in-search | PASS | — |
| /research/how-google-finds-crawls-understands-your-website | PASS | — |
| /research/how-to-monitor-debug-improve-google-search-performance | PASS | — |
| /policies/privacy-policy | PASS | — |
| /policies/terms-of-service | PASS | — |
| /policies/cookie-policy | PASS | — |
| /policies/refund-policy | PASS | — |
| /about/team/mohamad-husni | PASS | — |
| /about/team/shakeel-mohamed | PASS | — |
| /about/team/fathima-asna | PASS | — |
| /about/team/mohamd-arham | PASS | — |
| /services/mobile-application-development | PASS | Short description (83 characters): review whether it explains the page clearly. |
| /services/custom-software-development | PASS | Short description (64 characters): review whether it explains the page clearly. |
| /services/websites-and-web-applications | PASS | Short description (90 characters): review whether it explains the page clearly. |
| /services/business-software-and-management-systems | PASS | Short description (83 characters): review whether it explains the page clearly. |
| /services/e-commerce-solutions | PASS | Short description (51 characters): review whether it explains the page clearly. |
| /services/ai-and-automation-solutions | PASS | Short description (71 characters): review whether it explains the page clearly. |
| /services/crm-and-booking-solutions-where-applicable | PASS | Short description (72 characters): review whether it explains the page clearly. |
| /services/ui-ux-and-digital-product-development | PASS | Short description (80 characters): review whether it explains the page clearly. |
| /services/cloud-deployment-and-technical-solutions | PASS | Short description (63 characters): review whether it explains the page clearly. |
| /services/seo-and-website-optimization | PASS | — |
| /services/digital-marketing-and-related-digital-services | PASS | — |

## Article follow-up — 20 September 2026

- Blog/research HTML bodies with at least 400 words and four H2/H3 headings receive a keyboard-accessible, collapsible table of contents. Server-rendered native links add no client JavaScript. Existing heading IDs and internal CSS are preserved, generated IDs avoid collisions, and sticky-header scroll spacing is provided. Short articles and non-editorial content remain unchanged.
- Article update dates are visible when more than a day newer than publication, using actual stored timestamps. This is a record-update timestamp, not a claim that the author substantially revised the article.
- All 134 tests pass, including new anchor/collision/short-content regression cases. Lint and TypeScript pass. Production build checked; browser/device visuals remain unverified.
- Supabase CLI management access was checked again and still has no access token. Run `supabase login` locally, then migrations can be applied to the verified project; never paste credentials into chat.

## Article filtering follow-up — verified for release

Blog and Research now expose server-rendered GET search/category forms, using only their own published CMS records. Search covers readable titles, summaries/excerpts and tags. Categories derive from the current entries; unknown categories show a recoverable empty result. Clear-filter links and correctly associated labels are included. Query variants retain the collection canonical and use noindex/follow to avoid indexing internal search permutations. No client JavaScript or third-party service was added.

Local lint, TypeScript and all 136 automated tests pass. The production build subsequently passed after approval access returned. Six local production HTTP checks passed for Blog/Research unfiltered lists, unmatched searches and unknown categories, including correct canonical URLs, filtered noindex/follow directives, labelled search forms and clear-filter links. Browser/device visual checks remain unperformed.
