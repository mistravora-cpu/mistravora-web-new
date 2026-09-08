# Requirement calculator

The public route `/tools/cost-calculator` now uses the guided requirement calculator. Admin → Pricing Calculator edits its complete JSON configuration in the `requirement_calculator_config` setting. No new database schema is required. Empty settings use the approved brief's six baseline prices and feature rates.

## Configuration

- `projectTypes`: names, descriptions, base prices, included and optional capabilities, and baseline delivery week ranges.
- `questions`: labels, groups, input types, applicability, choice options, `when` and `whenFeature` conditions, score/scale rules and feature mappings.
- `features`: one price/score/duration allowance per capability, with central dependency rules. Bundled base capabilities have zero additional charge.
- `complexity`, `design`, `timelines`, `maintenance`: thresholds and multipliers/plans. `scaleThresholds` can measure numbers or the count of selected options.
- `minimum`, rounded range factors and `rounding`: investment range calculations.
- `phases`: labels and shares of the estimated delivery schedule; shares must sum to 1.
- `notice` and `exclusions`: client-facing scope conditions.
- `advancePercent`: always 30, as instructed. Maintenance is separate and budget never changes the calculated investment.

Additional module prices and delivery durations not specified in the supplied brief are editable planning assumptions. Review them before relying on the estimate for a commercial commitment. Integration prices are starting allowances; multiple systems trigger manual review. Hardware, hosting, paid services, taxes and translation/content scope are not silently included. A priority timeline is subject to capacity and scope agreement.

Increment `version` for changed pricing/questions. Keep IDs stable when only changing labels. Invalid or cyclic configuration is rejected. All business rules are recomputed on the server at submission.

## Submission and email

The final step asks for name/email and optional contact details with explicit consent. The enquiry is stored in `inquiries.message` as structured JSON, including its source, reference, configuration version, requirements, estimate, timeline, internal qualification and delivery status. Admin → Inquiries renders a structured view above the existing enquiry editor.

The caller's UUID makes retries idempotent; the server checks the complete request hash before returning an existing receipt. Pricing is never accepted from the browser. The PDF contains the preliminary estimate, 30% advance range, delivery phases, requirements, exclusions and company details. Internal qualification is not included in the customer PDF.

Configure `RESEND_API_KEY` and a verified-domain `EMAIL_FROM` in the server environment to activate delivery. Credentials never belong in the admin JSON. The implementation uses Resend's [email API](https://resend.com/docs/api-reference/emails/send-email), PDF attachments, and an idempotency key. Provider acceptance is recorded separately from actual inbox delivery; no inbox delivery guarantee is made. When configuration is missing or the provider fails, the saved enquiry and downloadable PDF remain available and the user is told email was not sent automatically.

No marketing subscription is created. No payment is collected. LocalStorage restores selection fields and the step for 7 days, excluding free-text business notes, URLs, dates and contact details. Users must re-enter omitted text after a reload. Start Over clears the saved selections. Do not supply confidential records or credentials.

The current IP limiter is instance-local, matching the existing contact infrastructure. Distributed anti-abuse limits and email-domain verification remain deployment concerns. Tests mock external delivery; no test emails or invented live enquiries were sent.

## Verification and email activation

Local lint, TypeScript, engine, submission-safety and PDF tests are available in `tests/requirements.test.mjs`, `tests/requirement-api.test.mjs` and `tests/requirement-delivery.test.mjs`. The engine suite covers all 16 scenarios from the supplied brief.

Verification completed locally on 2026-09-08:

- Lint and TypeScript pass.
- 69 automated tests pass, including 16 estimate scenarios, dependencies, pricing bounds, consent, idempotency, email failure, PDF generation and admin-route authorization.
- Production build completes successfully. The final local run logged Supabase timeouts during cached page-data revalidation; it was not a warning-free run.
- Chromium walkthroughs completed all six project types on alternating 390px and 1440px viewports. No horizontal overflow or runtime exceptions. Conditional marketplace, payment and custom-module questions were exercised. Final submissions were intercepted, so no test enquiries or emails were created.
- A sample multi-page PDF was generated and parsed successfully.

Admin → Inquiries includes protected PDF download and email-retry controls. Existing provider-accepted emails are not resent. Email credentials were absent from the local environment; configure them on Vercel and retry unsent quotations from the admin panel. Live inbox delivery has not been tested. Font licensing is included in `src/assets/fonts/OFL.txt`.
