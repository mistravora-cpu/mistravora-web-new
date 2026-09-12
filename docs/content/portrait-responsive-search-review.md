# Portrait quality, page width and search review

12 September 2026. Professional portrait revision and verification of the accompanying responsive/search changes.

## Team images

The four publicly displayed original portraits were checked directly. Each is **864×1080 pixels**, with file sizes between 39,700 and 57,194 bytes. The owner will supply larger originals later. This revision improves delivery and sizing; it does not invent additional detail or replace anyone's appearance.

- Team portraits use responsive AVIF/WebP derivatives at quality 85, while other images retain the default quality 75. Pasted external URLs continue to load directly.
- Portraits retain their 4:5 composition with `object-fit: contain`, descriptive alt text, a caption, and visible name/role. They are capped at 432 CSS pixels, so the existing 864px source supports a 2× display at the maximum resting size.
- The team grid spans the section's available width, with one column below 768px, two from 768px, and four from 1600px. The photograph and its caption share the same maximum width and aligned edges inside each grid column.
- The user requested a more professional effect. Photos now stay upright with a 1.5% CSS-only hover/focus zoom and a small profile-arrow movement. Removed the tilt, orbit, spotlight, client wrapper and pointer listeners. Names appear first, followed by quieter role text. Touch and reduced-motion settings use static portraits. There is no portrait JavaScript or new dependency.
- Admin → About now explains recommended photo dimensions. A 1728×2160 or larger original is preferable when available. The existing upload pipeline limits the longest side to 1920px without enlarging smaller sources, uploads to R2 and stores the URL in Supabase.

## Page width and enquiry flow

Removed the narrow outer wrappers from blog articles, projects and individual team profiles. Shared content headings and descriptions now use the available page width, with the existing side gutters. Portraits, decorative elements and controls keep appropriate individual size limits. Wide tables/code still scroll locally.

Blog/research cover images now use the shared responsive image component. Service links to `/contact?service=...` prefill the enquiry's optional service field and open that part of the form; the visitor can edit it. The URL value is limited to 100 characters and rendered as text. No advertising account, campaign spend, tracking provider or consent configuration was enabled.

## SEO, AEO and marketing readiness

- Confirmed that the production apex domain redirects with HTTP 308 to `https://www.mistravora.com`. Shared URLs, canonical metadata, social URLs, sitemap and business structured-data URLs now use that primary host. Older CMS canonicals using the apex are normalized when read; genuine external syndication canonicals remain supported. No database rewrite is necessary.
- Blank SEO override fields retain a page's title, description and image. Invalid canonical/image values fall back safely. A noindex override also applies explicitly to Googlebot and excludes that page from the sitemap.
- Image sitemap entries now include published team portraits, article covers, project images, industry images and collection images. Existing draft/publication filtering remains.
- About has an `AboutPage` and team `ItemList`; individual profiles use `ProfilePage` with a `Person` as the main entity. Article authors reflect the published byline instead of always identifying the company as the author. Article dates, main-page references and images are included where available.
- Removed two unsupported blanket statements: the project catalog no longer says every project has measured results, and the ROI tool no longer presents an unverified 15–40% uplift as typical.

The approach follows Google's [responsive image guidance](https://developers.google.com/search/docs/appearance/google-images), [profile-page structured data guidance](https://developers.google.com/search/docs/appearance/structured-data/profile-page), and [AI search guidance](https://developers.google.com/search/docs/appearance/ai-features). Search-readable content, accurate structured data and crawlable links matter; special AI markup is not required, and these changes do not guarantee rankings or inclusion in generated answers.

Actual paid search work still needs the campaign objective, target markets/languages, approved landing-page offer, budget, account access and conversion definition. Existing analytics/marketing consent settings remain unchanged.

## Verification

Passed on this revision:

- ESLint: zero errors and warnings.
- TypeScript and the production build passed with no build warnings.
- All 90 automated tests passed, including new canonical, partial SEO override, safe sitemap-image and sitemap exclusion tests.
- `git diff --check` passed.

- All 61 public routes passed expected HTTP statuses and canonical/description checks. No horizontal overflow was found at 320, 390, 768, 1024, 1280 and 1920px, at the top and bottom of each page. The intentional missing-page check returned 404.
- The team component passed checks at 280, 320, 390, 640, 768, 1024, 1440, 1600, 1920 and 2560px. Desktop hover, keyboard focus, reduced motion, touch behavior and portrait-to-profile navigation passed. The team grid had zero axe violations in light and dark themes. The selected service appeared in the contact form and remained editable.
- Desktop, phone, light-theme and profile screenshots were visually reviewed after image decoding. Focused checks confirmed quality-85 responsive image URLs and the absence of the old portrait motion/lighting elements.
- The generated sitemap contained 58 canonical page URLs on the primary www host and 14 image entries.
- Lighthouse 13.4.1 on the local production About page, using default simulated mobile throttling, scored **96/100 performance** and **100/100 automated SEO**. Largest contentful paint was 2.8s, total blocking time 10ms and cumulative layout shift 0. There were no audit run warnings; the SEO score is a technical audit, not a ranking guarantee.
- The research article `/research/sri-lanka-smart-bus-fares` scored **97/100 performance** and **100/100 automated SEO** under the same simulated mobile settings: 2.6s largest contentful paint, 10ms total blocking time and zero layout shift, with no audit run warnings.
- The route audit recorded four headless Chromium GPU-driver `ReadPixels` warnings from the existing homepage robot. A transient upstream timeout was also logged by the local server during the broad audit; all audited page responses passed. These external/runtime diagnostics are not hidden or described as zero warnings. Focused team/profile checks recorded no browser errors or warnings.

These results cover the local production build and browser emulation. They do not guarantee performance on every device, network or future uploaded asset. Earlier Lighthouse results in the team design report describe the previous deployment.

No live content, image, inquiry, email or database record was modified during this revision.
