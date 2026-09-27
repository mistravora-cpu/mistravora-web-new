# Admin / public-site cleanup — 27 September 2026

## Verified changes

- Services: removed the tagline control; neither the collection nor detail renderer reads it. Description, body, image, category, features and technologies remain.
- Resources: removed icon, featured and manually entered download-count controls, which have no public consumer. Connected the existing cover image to the catalog/detail mapping. Download links now use an HTTPS URL field rather than an image uploader.
- Hero text: limited the page selector and server-side save validation to pages that actually call `getHeroSection`. Hero media remains separately configurable for public paths through the existing fallback renderer.
- Settings: boolean status badges now distinguish enabled from disabled; the string `false` no longer displays as active.
- Solutions: removed unused nested pricing-package joins, mapping and types. Removed obsolete package/demo-link tables from the generic mutation allowlist and IndexNow table list. Existing database records remain intact.
- Removed unused public queries for all posts and all hero sections. Authenticated admin queries remain.
- Disabled automatic prefetch across the large admin sidebar to avoid fetching multiple database-backed dashboards before they are opened.

## Retained integrations

Homepage value cards/statistics, team/core values, pricing/calculator, solutions, industries, projects, demos, technology stack, service content, authors, glossary, knowledge base, articles, careers, FAQs, contact/social links, trusted companies, reviews, resources and policies have public consumers. Their controls remain. Business settings feed the profile, layout, contact, consent or discovery API. Marketing and page SEO controls supply metadata/tracking configuration.

Bookings, availability, inquiries, newsletter subscribers, campaigns, delivery logs, revision history, media and passwords are operational tools. They do not require matching public display sections to be useful and were not deleted.

No production content or database columns were deleted. Admin authorization, review publication approval and public-cache invalidation remain in place. This is a source-level integration audit; authenticated browser saves and production data were not modified during this pass.
