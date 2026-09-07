# Website legal, privacy and accessibility review

Review date: 7 September 2026. Business: Mistravora, Sri Lanka. Supabase project: `ghixwjdxzrovdmdzocxj`. This is a technical and content risk review, not a legal opinion, compliance certification or guarantee against disputes. Owner-only questions were sent during the work; unanswered facts remain unresolved below.

## Policy pages and business information

The existing four policy records contained “[Full body to be expanded.]”. Replaced those records with substantive, editable notices at:

- `/policies/privacy-policy`
- `/policies/terms-of-service` (titled Terms and Conditions; existing URL preserved)
- `/policies/cookie-policy`
- `/policies/refund-policy`

They state the confirmed name, Sri Lanka base, founding information, email, phone and distinction between 24/7 enquiry availability and live support. They do not invent a registered legal entity, street address, VAT number, contract jurisdiction, deposit, warranty or refund percentage. Refund requests go to the verified business contact; mandatory legal rights are preserved. The retention section explicitly discloses that operational periods and automated deletion are not finalized.

**Before treating these notices as final legal documentation:** provide the actual contracting identity and public business address, purposes/lawful bases for each data flow, retention schedule, processor agreements/regions, contractual terms, and target consumer markets. Have the resulting documents reviewed by a Sri Lankan lawyer familiar with your cross-border sales. Do not accept payment under unagreed terms simply because policy pages now exist.

## Applicable-law findings and limits

### Sri Lanka

The Consumer Affairs Authority describes misleading/deceptive conduct as within its consumer protection work. Removing unsupported performance claims, fabricated testimonials and unconfirmed commercial promises reduces this identified risk. Scope, total charges and material conditions still need to be accurate in quotations and advertising. [CAA divisions and functions](https://www.caa.gov.lk/web/index.php?Itemid=539&catid=83&id=124%3Amain-divisions&lang=en&option=com_content&view=article), [CAA Act overview](https://www.caa.gov.lk/web/index.php?id=111&lang=en&option=com_content&view=article).

Sri Lanka's Personal Data Protection Act No. 9 of 2022 has been amended by Act No. 22 of 2025. **Do not rely on the older March 18, 2025 commencement banner alone.** Later official material states that the original enforcement date was amended, and an October 23, 2025 DPA release says determining enforcement dates depends on institutional steps. A definitive later commencement instrument was not established in this review. Confirm the currently operative provisions and gazettes with the DPA/legal adviser; this uncertainty is not a reason to collect unnecessary data. [DPA amendment material](https://www.dpa.gov.lk/guidelines.php), [official postponement release](https://www.dpa.gov.lk/media/MEDIA%20Release%20-%20PDPA%20enforcement%20extended%20-%20English%20V%203.0%20in%20Letterhead.pdf), [October 2025 DPA release](https://www.dpa.gov.lk/guid/Press%20release%20DPA%20%281%2923%20Oct%20%202025.pdf).

Photographs, writings, software and other original works can be copyright-protected under Sri Lankan law. Possessing an image or a public URL does not establish permission to republish it. [National Intellectual Property Office copyright guidance](https://www.nipo.gov.lk/web/index.php?Itemid=149&id=31&lang=en&option=com_content&view=article), [Intellectual Property Act No. 36 of 2003](https://www.nipo.gov.lk/web/images/pdf_downloads/Intellectual_Property_Act_No_36_of_2003.pdf).

### Cross-border services — conditional, not automatically applicable everywhere

EU GDPR territorial scope may extend to offering goods/services to people in the EU or monitoring their behaviour there. Mere website accessibility is not enough by itself; targeting and processing facts matter. Confirm whether Mistravora targets EU/EEA residents, and assess transfer arrangements and any representative obligation if relevant. [EDPB territorial-scope guidelines](https://www.edpb.europa.eu/documents/guideline/guidelines-32018-on-the-territorial-scope-of-the-gdpr-article-3-version-adopted_en).

Where UK cookie rules apply, non-essential storage generally needs permission; exceptions and newer rules need assessment for the specific technology. Do not label general advertising or session recording as necessary. The chosen conservative implementation leaves optional scripts off and provides equal Accept/Decline options, unselected preferences and withdrawal. This review does not establish that a Sri Lankan site always needs a banner under Sri Lankan law alone. [ICO cookies guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/).

Where EU consumer distance-contract rules apply, a 14-day withdrawal period commonly applies, with detailed rules for services and digital content, including early performance requests and exceptions. Do not reuse a generic “no refunds” template or assume bespoke software automatically removes every consumer right. The public refund notice preserves mandatory rights; actual sales processes need a market-specific review. [European Commission consumer distance-selling guidance](https://europa.eu/youreurope/business/selling-in-eu/selling-goods-services/ecommerce-distance-selling/index_en.htm).

Other countries' laws, sector-specific rules, employment, tax, business registration, child-directed processing and payment obligations depend on actual operations. They were not exhaustively determined here.

## Data and tracking changes

- Optional GTM, GA4, Clarity, advertising pixels and session-recording injection removed from the active root layout. Their CMS IDs are retained, not silently erased. Admin pages also no longer receive this injection. Do not re-enable before reviewing the actual container tags, masking, transfers, cookie lifetimes and notice.
- Analytics event collection and campaign attribution capture removed from the public layout; submitted contact attribution is discarded on the server.
- Cookie preferences use a native modal dialog with browser-managed focus trapping, Escape handling and focus return, native keyboard-operable checkboxes, equal Accept/Decline controls and no preselection. Old/invalid/expired choices require a fresh choice. Consent lasts 180 days in the implementation, with a version change for this revision.
- Withdrawal reloads the page to stop previously executing third-party code. It does not claim to remove cookies on third-party domains or erase information already sent. Browser settings remain available for legacy cookie cleanup.
- Google Maps iframe removed; the external link is an explicit visitor action. Research HTML is sanitized to remove scripts, event handlers, frames, embedded forms and inline image tracking; editorial text and safe links remain.
- AI API delivery paused; the assistant uses local replies from public content. No user message is sent to an external AI model in this revision. The visitor sees a privacy link and a sensitive-data warning.
- Campaign cron now requires `EMAIL_CAMPAIGNS_APPROVED=true` in addition to existing authentication/provider configuration. This is intentionally off by default. Before enabling, establish eligible audience evidence, unsubscribe handling, sender identity and provider terms. This review did not send any email or inspect private subscriber records.
- Form permission is validated server-side for contact, newsletter and booking; newsletter opt-in is separate from requesting a response. Current contact inputs require name, reply email and message; optional project/phone fields remain optional. Booking uses name, email, slot and optional message. Newsletter asks only for email.

**Remaining operational work:** durable per-subscriber consent wording/version evidence and double-opt-in if chosen; a retention/deletion job and backup process; access/rectification/deletion handling; a processing/processor register; deployed-provider settings and logs; legal holds; breach handling; any required transfer mechanism. Existing database creation timestamps alone do not prove what someone consented to. No private customer history was manufactured, altered or deleted.

## Claims withheld from publication

Preserved the reviewed records in the admin but unpublished the four unverified testimonials, four unsupported statistics, seven client endorsements/logos, seven seeded case studies with unsubstantiated dates/results, and six broad benefit claims. These must not be republished until their facts and permissions are evidenced. Existing project names alone do not verify delivered features or percentage improvements. Several seeded projects predate the confirmed May 2025 founding date; confirm any earlier founder-work attribution.

Removed fallback fabricated reviews, fictional client names and fallback metrics so empty tables cannot restore them. Withheld three unconfirmed staff records; retained the confirmed founders and corrected the unsupported founder biography. Removed the unapproved referral reward and “senior team” statement. Removed unverified social-profile links and price-range claims from organization structured data.

Published pricing now directs visitors to a written quotation; numerical cost/ROI tools are temporarily withheld rather than presenting unapproved rates and conversion assumptions. Corrected pricing/timeline/maintenance FAQs and assistant replies. This does not alter existing signed contracts. Service copy, later admin edits, blog/research assertions and off-site advertising still require ongoing factual review. A newly uploaded research article was not automatically labelled original experimental research or given invented evidence.

## Images, copyright and assets

| Asset category | Finding / action | Evidence still needed |
|---|---|---|
| Mistravora logo, icons and favicon variants | User-supplied brand identity remains. No source licence/copyright transfer supplied | Creator identity, source file, ownership/licence for commercial website use |
| Shakeel portrait in R2 | Retained the owner-requested portrait; name used as alt text; lazy-loaded with dimensions | Photographer licence and subject permission. Uploading it does not prove copyright ownership |
| Client logo and project screenshots | Endorsement/project records withheld pending evidence | Each client's publication approval, image licence, attribution requirements and removal of confidential data |
| Technology logos | Replaced automatic external logo requests with text/initials; references do not imply partnership | Review each provider's logo-use rules; preferably serve licensed copies locally |
| Research/article cover images and downloads | CMS-provided assets need individual review; body HTML cannot load arbitrary inline image pixels | Source URL/file, creator, licence, attribution, commercial-use permission; permission for included screenshots/text |
| Fonts and package assets | Code uses packaged Geist and Lucide resources | Preserve applicable package licences; check any added font/logo separately |

**Copyright status is not verified merely by alt text or an automated scan.** Obtain the evidence above or replace/remove disputed assets. This task does not grant redistribution rights. The source package's licence and a client's logo permission are different questions.

## Accessibility approach and limits

Used WCAG 2.2 AA as the review target, not a claim that every page is certified. Normal text generally needs 4.5:1 contrast, large text 3:1, with additional non-text contrast, keyboard and focus requirements. [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [W3C contrast explanation](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum/).

Added visible focus outlines for custom controls, native checkbox labels and field feedback, modal keyboard handling, clearer consent labels, and reduced-motion handling for the automatic robot (loads a still scene under that preference). Existing source image elements carry alt attributes; CMS body image pixels are removed by the sanitizer. Alt text still needs human review for meaning, not just presence. Native controls and the skip link are retained. An automated scan cannot establish screen-reader usability, cognitive accessibility, all hover states or the accuracy of supplied image descriptions.

See the verification report for the actual tested pages and remaining automated findings. Untested states, future CMS content, admin editor flows and third-party destinations must not be represented as passing this audit.

## Owner answers still required

1. Legal/trading identity, public business address and actual contracting jurisdiction.
2. Consumer sales/targeting in Sri Lanka, EU/EEA, UK and other markets; B2B versus B2C.
3. Written deposit, cancellation/refund, support, warranty, ownership and payment terms.
4. Retention by data type, provider backups/regions/agreements, access roles and request handler.
5. Licences and publication approvals for logos, portraits, screenshots, articles and downloads.
6. Verified testimonials, projects, team roster, numerical results and approved evidence dates.
7. Whether to re-enable any specific tracker, email campaign or external AI provider after configuration and data review.

No passwords, API keys, identity documents or private customer files should be pasted into this content brief.

Additional findings fixed: removed the audit tool’s mandatory email and silent sales-lead insertion; it now requests only a public URL with explicit PageSpeed permission, removes URL query/fragment data, and does not store a lead. Added a persistent Pause animations control in the footer. Corrected About timeline list semantics and rendered policy section titles as real headings. A second light-theme scan after initial theme hydration did not reproduce the transient contrast findings; final recorded checks use settled page styles.

## Verified technical results

- ESLint passed; all 19 unit tests passed; production webpack build passed.
- Twenty-two axe-core scans (11 routes × dark/light) found no violations in the tested WCAG A/AA rule sets. Routes: home, contact, about, pricing, all four policies, the published research article, booking and website audit.
- Mobile viewport 390 × 844; reduced motion enabled during page scans. A native-dialog check verified unchecked defaults and Escape dismissal. Withdrawal and persistent animation-pause controls passed.
- No tested analytics, advertising, external technology-logo, Maps or AI requests occurred before or after consent choices. No personal-data submissions were made.
- These are local production-build results; see deployment verification for live checks. Full normal-motion interaction, every screen-reader/browser combination, authenticated admin content and third-party destinations are not certified.
- Repeat using `scripts/verify-privacy-site.mjs` with `AUDIT_URL`, `PLAYWRIGHT_MODULE`, `AXE_MODULE` and the browser installation configured. The test does not submit enquiries or subscriptions.

Image alt attributes were inspected in source and checked by the automated scans. No inaccurate descriptions were invented to fill image permissions or meaning. Technology logos were replaced with text, and unverified client/project images were withheld. The retained owner-requested portrait and brand assets still require documentary rights confirmation.
