# Hero media completion checks

Verified 2026-09-08:

- Isolated Chromium browser using the real hero player and admin editor: image rotation and wrap-around, reduced-motion handling, manual selection, matching form labels, serialized save payload, muted WebM autoplay and advancement to the next image. No runtime exceptions. Test media and save calls were local fixtures, not production uploads or records.
- Production-build mobile checks at 390px: About, Projects, Research and Contact returned HTTP 200 with no horizontal overflow or runtime exceptions.
- Hero media deployment `faf55b2`: Vercel reported successful deployment.
- Final automated suite: 39 passing tests, including optional project-link save/clear validation. Lint and production build checked separately.

## Optional project links

The public website/demo field is available in Admin → Projects without migration 0042. Writes use one settings record per project (`project_public_link:<id>`), so editing separate projects does not overwrite a shared link map. Public reads request only keys belonging to the selected projects. Blank values suppress links; HTTPS validation rejects executable and credential-bearing URLs.

If an older database already has a `website_url` column, its value remains a fallback until the link is explicitly edited. Migration 0042 remains optional; no CLI login is required for this feature. Sensitive systems should leave the field blank.

Browser fixture saving verifies the editor payload. Production writes were not simulated with made-up project links or customer data.
