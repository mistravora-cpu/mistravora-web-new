# Customer reviews and marketing updates

## How to publish real reviews

Open **Admin → Customer reviews** (`/dashboard/testimonials`). Enter the customer's actual quote, approved public name, optional role/company and optional photo. Uploads use the existing R2 media flow; public image URLs can be pasted directly.

Enter the source name (for example Google, Facebook, email or direct feedback), an optional public link to the original review, and the original review date if known. Leave the rating blank or use `0` unless the customer actually supplied a rating. Do not include private inbox URLs, customer records or consent documents.

Confirm permission and enable **Published**. Choose display paths, one per line:

- `/` — Home
- `/about`, `/pricing`, `/contact`
- `/services`, `/solutions`, `/projects`, `/industries`
- A specific service, solution, project or industry path, such as `/projects/shopmate`

New reviews default to Home, About and Pricing when the display field is omitted. Clearing all paths requires keeping the review as a draft. Detail pages use exact matches; an unrelated review is not presented as an endorsement of that service or project. Up to six cards appear initially; additional reviews use a keyboard-accessible disclosure without repeated carousel copies.

The four old sample testimonials remain unpublished. No customer reviews were invented or imported. Real reviews will appear once the owner enters and approves them.

## Database and publication safety

Verified Supabase project: `ghixwjdxzrovdmdzocxj`. Existing `testimonials` rows hold the quote, attribution, image, rating, order and publication state. Public source/date/placement metadata is stored under `testimonial_details:<id>` in the existing `settings` table. No migration is required.

Review saves require authenticated admin membership. Source URLs, ratings, dates, image URLs and page paths are validated on the server. Reviews are saved as drafts before metadata is written, then published. Partial failures retain a draft and its ID for retry. Public rendering requires permission and a fingerprint matching the actual quote, attribution, photo and rating. Direct database edits to those fields must be re-approved in the admin. Deleting a review also removes its metadata. The shared public cache is invalidated after changes, including partial writes that leave drafts.

`settings` is already public-readable; only public attribution belongs in review metadata. Private permission evidence should remain in the company's private records.

## Admin controls connected or corrected

| Admin control | Public output |
| --- | --- |
| Customer reviews | Home, About, Pricing, Contact, catalogues and selected detail pages |
| Home → Value cards | Home “How we work with you” section |
| Tech Stack | About “Tools and platforms for your project”; each published item appears once |
| Careers → Jobs | Current published vacancies and application email links; empty state only if no jobs are published |
| Careers → Benefits | Careers, only for published benefits; old unrelated sample benefits remain unpublished |
| Questions & answers | New central editor; general answers on Home and Contact, or exact selected pages |
| Contact FAQs | Replaced the duplicate editor with a link to the central Questions & answers screen |
| Statistics | Preserve actual CMS values, including zero, decimals and availability formats; no inferred percentages or fallback numbers |
| Marketing & SEO | Search verification, social preview defaults, supported GA4/Google Ads IDs and explicit tracking switch |

Removed unused static service/pricing data, repeated review/technology carousel code, duplicate homepage Website schema, and marketing editor controls/scripts for providers that had no functioning public integration. Old unused provider settings in Supabase were not deleted. Social profile links remain editable under Contact. Operational screens such as inquiries, subscribers, bookings, deliveries, campaigns and revisions intentionally remain private admin tools; they are not public marketing content.

## Search and marketing

Business settings, homepage introduction, two existing service pages, three FAQs and two value-card descriptions were updated and read back from the verified project. Existing service URLs were retained. The copy describes software, websites, mobile apps, SEO and digital marketing from Sri Lanka, with worldwide service coverage. Specific advertising channels and deliverables still require agreement; the owner's detailed channel list has not been supplied.

The homepage metadata uses editable business settings. The organization schema links published services and public social profiles. Footer links make the software, SEO and digital marketing service pages easier to find. Questions and reviews render as readable HTML. No self-serving Organization/LocalBusiness review-star schema was added.

**Optional tracking remains off.** In Marketing & SEO, the owner can configure GA4 and/or Google Ads and enable them after reviewing provider settings and policy disclosures. Analytics and marketing require their respective visitor consent. Scripts only mount in the public layout. GA4 page views and lead events use page paths without query strings. Successful contact/quotation submissions can send Ads conversion events when an Ads ID and conversion label are configured and marketing consent is granted. No contact form contents, names, email addresses or phone numbers are added to these events. No paid campaign or live advertising conversion was created during testing.

Google Analytics enhanced measurement settings and Ads conversion definitions still belong to the account owner. Before enabling tracking, check those account settings and confirm current cookie/privacy disclosures. Country-specific Google advertising endpoints may require a CSP update if Tag Assistant reports one for a target market.

Search visibility depends on useful original content, actual customer evidence, site performance, business citations and search indexing. Website changes cannot guarantee first place in Google or inclusion in an LLM answer. Useful next inputs are genuine reviews, approved case-study results, confirmed marketing deliverables, and verified business/search account details. Do not publish “Sri Lanka's best” as an unsupported fact.

Sources checked:

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) — useful text, internal links and accurate structured data; no special AI schema requirement.
- [Google: review rich results](https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful) — self-serving business review stars are not eligible.
- [Google tag API](https://developers.google.com/tag-platform/gtagjs/reference) and [CSP requirements](https://developers.google.com/tag-platform/security/guides/csp) — supported conversion events and restricted provider endpoints.

## Verification

110 automated tests, lint and the production build passed. All 57 sitemap URLs passed the status/title/description/canonical/heading checks. Browser verification covered 40 page/width combinations plus five review-card fixture widths; it found no JavaScript errors, console warnings or automated accessibility violations. Local mobile Lighthouse scored 91 performance and 100 accessibility, best practices and SEO, with the robot starting automatically. This is a local production measurement, not a guarantee for every live connection.

See `docs/audits/reviews-marketing-release.json` for the final test/build/browser evidence. The browser fixtures contain synthetic reviews only for local layout testing and were never written to Supabase. No authenticated production admin mutation or live email/advertising submission was used as a test.
