# Pricing and robot release — 2026-09-14

The guided requirement brief, estimate and quotation flow is now on `/pricing#estimate`, above the published packages. The previous `/tools/cost-calculator` address returns a permanent 308 redirect. Quote/start buttons across public pages, CMS hero buttons, the tools directory, admin preview, search and assistant guidance point to Pricing. Actual contact/support and booking links retain their purpose.

Service and package selections are carried into an editable brief field and the stored/PDF summary without changing the calculation. Questions, dependencies, recommendations, prices, delivery phases, exclusions and notification recipients remain admin-managed. The 30% advance, server-side recalculation, independent customer/staff notification retries and explicit form consent are preserved. No database migration is needed.

Calculator fixes include consistent field validation, focus on invalid fields and the receipt, visible errors when returning to an unanswered step, return-to-review navigation, protection against stale-draft restoration during package navigation, a bounded request wait, retained retry references, and planning another project after submission. Free-text context and contact details are not stored in the local draft. Zod validation no longer probes runtime compilation under the existing CSP.

The robot now receives pointer events across the whole hero, including over text. Clicks on native buttons/links keep their normal behavior. Touch release, cancellation and leaving the hero reset its movement target. Reduced-motion click reactions invalidate the canvas both when starting and ending. Existing automatic startup, offscreen/background suspension, shader-startup fallback and WebGL context recovery remain intact. Small-screen/coarse-pointer sessions use fewer pixels and lighter materials; desktop retains the original materials. The hero text backdrop uses valid theme colours and correct position coordinates.

Public pages share a main landmark; embedded HTML normalizes nested `main` elements while preserving their scoped CSS. Floating contact controls have a named landmark. Pricing has descriptive/social metadata and structured page data, and its duplicated highlighted heading suffix is removed. Prerender concurrency is limited to reduce bursts of Supabase reads.

## Verification

- ESLint, TypeScript within the production build, and all 95 automated tests pass.
- Final webpack production build completes without errors or warnings. Earlier runs experienced intermittent Supabase timeouts; the final capped-concurrency run was clean.
- All 57 sitemap pages return HTTP 200, with a title, description, canonical, one H1 and one main landmark.
- All six configured project flows pass browser checks, including incomplete-answer recovery, contact-method validation, retry reference retention and PDF downloads. Submission and delivery are intercepted; no live enquiries or emails were created.
- Five public pages at six widths (320–1920px) have no horizontal overflow. Calculator contact states and the complete mobile Pricing page have no axe violations in the tested states.
- Repeated robot clicks, movement over hero text, offscreen return, reduced motion and WebGL context restoration pass. Mobile taps and returning from Pricing also resume rendering.

| Local mobile Lighthouse | Performance | Accessibility | Best practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| Pricing | 95 | 100 | 100 | 100 |
| Homepage, automatic 3D | 83 | 100 | 100 | 100 |

The homepage improved from the first measured 72 but remains below the earlier 85+ target. Its initial GPU work is the remaining constraint in these simulated mobile runs. This report does not promise those scores on all devices or networks. Live email delivery and provider configuration were not exercised. Automatic test failures deliberately inject one HTTP 503 to verify safe retry; it is not a production service failure.

Machine-readable measurement summary: `docs/audits/pricing-robot-release.json`.
