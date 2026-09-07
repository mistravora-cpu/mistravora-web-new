# Admin and public website synchronization

Public content uses the shared `public-data` cache tag. Successful admin actions
expire the tag and root layout. Private CRM/operational records remain private.

| Admin area | Public destination / behavior |
|---|---|
| Home value cards / statistics | Homepage; only published rows |
| Hero sections | Homepage robot overlay and existing page heroes; hero copy takes priority over business-profile fallback copy |
| About | Published core values/team; removing all rows no longer restores static values |
| Pricing | Active tiers, features, notes and add-ons at `/pricing` |
| Pricing calculator | Editable JSON drives `/tools/cost-calculator`; default current rates until first save; unique IDs and valid amounts enforced |
| ROI calculator | `/tools/roi-calculator`; visitor-entered financial assumptions, not promised outcomes |
| Solutions / industries / projects | Existing listing and detail routes, publication/archive filters retained |
| Demo apps | New `/demos` catalog linked from Tools and sitemap; published entries only |
| Tech stack | Published entries; no static repopulation when empty |
| Services / authors / glossary / knowledge base | Existing collection/detail pages, images and article HTML now rendered on details |
| Blog / research | Published listing/detail pages, primary-image cards and sanitized inline article content |
| Careers | Existing published vacancies |
| Contact | Contact facts, contact headline/description, published contact FAQs and social profile links |
| Booking slots | Available slots on `/book`; booking records remain private |
| Trusted companies / testimonials | Existing published records only; previously withheld evidence is not automatically republished |
| Resources | Published resources and download links |
| Policies | Active policies and footer links; current redesigned policy pages preserved |
| Settings | Header brand; business profile; SEO homepage title; footer; visibility of newsletter/chat/business hours/cookie banner; map coordinates |
| Media | Files linked into primary-image/body fields; a library upload alone does not choose a page or publish an article |
| Marketing / SEO | Page SEO and verification IDs active; analytics/ad/session-recording integrations remain paused, explicitly labelled in admin |
| Inquiries / newsletter records / bookings / campaigns / deliveries / revisions | Private operations; never a public content feed |
| Password / sign-out | Admin authentication only |

The cookie-banner switch controls the initial banner only. Footer preferences
remain available and optional tracking remains disabled. No social-media API was
connected. No unpublished reviews, client claims or staff were reactivated.

The website has no animation pause control or hover-to-pause interactions.
System reduced-motion accessibility preferences and offscreen/hidden-tab robot
suspension are retained; these avoid unnecessary GPU work.

Removed unused alternate pricing wizard, static technology fallback data and
unused broad public settings reader. The approved calculator, pricing and demos
now have real public destinations instead of being treated as dead code.

Validation: see the final task result for test/build/browser results. Existing
open visitor tabs are not live-pushed; updated content is returned on subsequent
requests/navigation after cache invalidation. Future provider outages and edits
can still produce errors; passing checks are not a perpetual guarantee.
