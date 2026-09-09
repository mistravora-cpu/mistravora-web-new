# HTML content and images

Open the relevant content section in the admin panel and edit its **Content (HTML and internal CSS)**, description or biography field. Fields with **Preview HTML and CSS** accept either plain text or HTML. Short titles, catalog summaries, SEO fields and structured lists remain plain text.

HTML editing is available for articles, research, projects, solutions, services, industry descriptions, team and author biographies, knowledge-base articles, glossary explanations/examples, resource descriptions, policies, hero descriptions, contact descriptions/FAQ answers, demos and pricing descriptions/notes. The company story in Settings also accepts HTML.

## Writing and previewing

Use paragraphs, headings, lists, links, tables, figures, captions and disclosure sections. Add an internal `<style>` block for colors, spacing, grids, responsive media queries and hover transitions. Styles are scoped to that individual content block. They cannot restyle the navigation, footer or other content blocks.

The public page renders the content as HTML on the server, so its text remains available to search engines without a browser compiler or a second reading view. A pasted document's `<h1>` is normalized to `<h2>` because the page already has its main heading. CSS selectors targeting that heading are normalized too.

Click **Preview HTML and CSS** before saving. Preview uses the same sanitizer as the public page, inside an isolated admin-only frame. Its surrounding typography differs from the public site's theme. Refresh the preview after editing. Preview supports up to 200,000 characters.

Executable scripts, forms, embeds, remote stylesheets, font imports and remote CSS image loads are removed. Positioning overlays and CSS keyframe animations are also excluded; use the site's existing animations or lightweight hover transitions. CSS is ordinary CSS, without Sass compilation or Tailwind class generation. Classes need corresponding internal CSS unless they already exist in the site's stylesheet.

```html
<style>
  .project-highlights { display: grid; gap: 1rem; }
  .project-highlight { padding: 1rem; border: 1px solid #64748b; border-radius: 12px; }
  @media (min-width: 700px) {
    .project-highlights { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    .project-highlight { transition: transform 180ms ease; }
    .project-highlight:hover { transform: translateY(-2px); }
  }
</style>
<h2>Project overview</h2>
<p>Write the approved project explanation here.</p>
<div class="project-highlights">
  <section class="project-highlight"><h3>Challenge</h3><p>Explain the actual need.</p></section>
  <section class="project-highlight"><h3>Approach</h3><p>Describe the work delivered.</p></section>
</div>
```

## Images and catalogs

- A saved primary/cover image takes priority in the catalog and detail page. Where the content has no primary image, the first valid image in its content becomes the preview image. This fallback does not overwrite the database's image field.
- Uploads use the existing optimized R2 upload flow and store the resulting URL in Supabase. Pasted HTTPS image links remain usable directly.
- For images inside content, place the cursor between HTML blocks, use **Add an image**, supply the upload or URL and a meaningful description/caption, then select **Insert image into content**. Repeat for additional images. Avoid placing the cursor inside an HTML tag or CSS rule.
- The image description supplies both its alt text and visible caption. Describe what is shown; avoid keyword repetition. Publish only images you are permitted to use.
- Uploaded R2 catalog images and team portraits use responsive cached image sizes. Arbitrary external URLs are displayed directly, so their source file size and availability still affect loading.
- Team portraits use consistent 4:5 frames without an outer card, with a name, role, descriptive alt text and subtle hover/focus motion. The full editable biography appears on the person's profile.

Solution content has one editor. Saves also synchronize its older fallback fields so edits and intentional clearing stay consistent. These improvements use existing Supabase fields and the existing public-content cache invalidation; no content migration or replacement is required.

## Verification — 9 September 2026

- 86 automated tests passed, including CSS isolation, responsive selectors, sanitization, primary-image selection, authentication and solution content clearing.
- ESLint and the production build passed; the build also checked TypeScript.
- Chromium verified multiple-image insertion, matching form labels, the sandboxed preview and saved HTML. The isolated admin editor had zero axe violations. Public solutions, About, research, projects and services pages returned HTTP 200, with no horizontal overflow at 390px and no browser errors or warnings during the check.
- Mobile Lighthouse 13.4.1 on the local production About page: **95/100 performance**, 1.4s first contentful paint, 2.9s largest contentful paint, 10ms total blocking time and zero cumulative layout shift. This is a simulated mobile audit of that page, not a guarantee for every device, connection or future uploaded asset.
- The homepage's automatic 3D startup now waits for font readiness and two paint frames before requesting its bundle. A fresh-origin/profile simulated mobile audit scored **96/100**, with 2.8s largest contentful paint, 30ms blocking time and zero layout shift. A separate audit with actual DevTools CPU/network throttling scored **99/100** with 1.6s largest contentful paint. The two throttling methods are different measurements and should not be compared directly. Browser interaction checks confirmed automatic robot rendering and pointer response, and desktop portraits measured 384px wide at a 4:5 ratio.

The startup sequence uses the browser's [font readiness promise](https://developer.mozilla.org/en-US/docs/Web/API/Document/fonts) before yielding paint opportunities; it has no device, connection or benchmark detection and does not require a visitor click.

Browser fixtures stayed local and used mock admin saves. No test content, images, inquiries or emails were written to the live database.
